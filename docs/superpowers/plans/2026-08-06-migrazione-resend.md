# Migrazione notifiche email a Resend — Piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire l'invio SMTP verso Aruba, che uccide il worker Supabase per esaurimento del budget CPU, con una chiamata HTTP all'API di Resend.

**Architecture:** `send-notification` smette di aprire una connessione SMTP e invia tutti i destinatari con una sola POST all'endpoint batch di Resend. L'handshake TLS non è più a carico del worker, quindi il fusibile da ~2 secondi di CPU non scatta e la function arriva sempre alla scrittura di `email_logs`. Il render dell'HTML, l'autenticazione e la costruzione dei destinatari restano invariati.

**Tech Stack:** Deno (edge function Supabase), React 18 + TypeScript + Vite + TanStack Query (frontend), Resend REST API.

**Spec:** `docs/superpowers/specs/2026-08-06-migrazione-resend-design.md`
**Branch:** `feat/notifiche-resend`

## Global Constraints

- Mittente, ovunque: `TaxiTime <noreply@taxitime.app>`. Su questo account Resend `taxitime.it` **non è verificato**: usarlo fa fallire l'invio.
- Indirizzo di risposta, ovunque: `reply_to: "info@taxitime.it"`.
- Endpoint: `POST https://api.resend.com/emails/batch`, massimo 100 messaggi per richiesta, limite di 10 richieste al secondo per team.
- Chiave: `Deno.env.get('RESEND_API_KEY')`. Non scrivere mai la chiave nel codice o nel repo.
- **Nessun fallback SMTP.** Reintrodurrebbe l'handshake che causa il guasto.
- Non toccare: il render (`renderUnifiedEmail` e helper), il blocco di autenticazione, `invokeWithRetry.ts`, le colonne `email_enabled` e `email_notifiche_admin`.
- Non cancellare le colonne `smtp_*` dalla tabella `impostazioni`: contengono la password Aruba cifrata, unica via di ritorno.
- Il repo **non ha alcun framework di test** (`package.json` espone solo `dev`, `build`, `build:dev`, `lint`, `preview`) e Deno **non è installato** in locale. La verifica statica del frontend è `npx tsc --noEmit` + `npm run lint` + `npm run build`; la verifica comportamentale delle edge function avviene nel Task 5 tramite uno slug canarino e invocazioni in `test_mode`.
- Il progetto Supabase è `iczxhmzwjopfdvbxwzjs`. Si chiama `dev-taxitime` ma **è la produzione**: non esiste ambiente di staging.

---

### Task 1: Portare l'invio principale di send-notification su Resend

**Files:**
- Create: `supabase/functions/send-notification/resend.ts`
- Modify: `supabase/functions/send-notification/index.ts` (import in testa; blocco config righe ~672-676; blocco invio righe ~882-981)

**Interfaces:**
- Produces: `sendResendBatch(messages: ResendMessage[]): Promise<ResendBatchResult>` e i tipi `ResendMessage` / `ResendBatchResult`, usati anche dal Task 2.

- [ ] **Step 1: Creare il modulo Resend**

Creare `supabase/functions/send-notification/resend.ts`:

```typescript
// Invio email tramite l'API HTTP di Resend.
//
// Perche' non SMTP: l'handshake TLS di denomailer avveniva dentro il worker
// Supabase, che dispone di ~2 secondi di CPU per invocazione. Quando Aruba non
// accettava subito la connessione il worker veniva terminato con "CPU Time
// exceeded" (HTTP 546) prima di inviare e prima di scrivere email_logs, e la
// notifica spariva senza lasciare traccia. Una fetch non addebita al worker il
// costo dell'handshake.

const RESEND_BATCH_ENDPOINT = 'https://api.resend.com/emails/batch';
const FROM = 'TaxiTime <noreply@taxitime.app>';
const REPLY_TO = 'info@taxitime.it';

// L'endpoint batch accetta al massimo 100 messaggi per richiesta.
const MAX_PER_REQUEST = 100;

export interface ResendMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface ResendBatchResult {
  ok: boolean;
  /** Un elemento per messaggio, nello stesso ordine dell'input. null se non inviato. */
  ids: (string | null)[];
  /** Messaggio d'errore leggibile, null se tutto ok. */
  error: string | null;
}

export function buildBatchPayload(messages: ResendMessage[]): Record<string, unknown>[] {
  return messages.map((m) => ({
    from: FROM,
    to: [m.to],
    reply_to: REPLY_TO,
    subject: m.subject,
    html: m.html,
    text: m.text,
  }));
}

export async function sendResendBatch(messages: ResendMessage[]): Promise<ResendBatchResult> {
  if (messages.length === 0) {
    return { ok: true, ids: [], error: null };
  }

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    return {
      ok: false,
      ids: messages.map(() => null),
      error: 'RESEND_API_KEY non configurata',
    };
  }

  const ids: (string | null)[] = [];

  // Oltre 100 destinatari l'endpoint rifiuta la richiesta: si spezza in blocchi
  // invece di troncare in silenzio.
  for (let start = 0; start < messages.length; start += MAX_PER_REQUEST) {
    const chunk = messages.slice(start, start + MAX_PER_REQUEST);

    let response: Response;
    try {
      response = await fetch(RESEND_BATCH_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildBatchPayload(chunk)),
      });
    } catch (err) {
      const message = (err as Error).message;
      console.error('[RESEND] Chiamata fallita:', message);
      return {
        ok: false,
        ids: messages.map(() => null),
        error: `Chiamata a Resend fallita: ${message}`,
      };
    }

    const bodyText = await response.text();

    if (!response.ok) {
      console.error(`[RESEND] HTTP ${response.status}:`, bodyText);
      return {
        ok: false,
        ids: messages.map(() => null),
        error: `Resend HTTP ${response.status}: ${bodyText}`,
      };
    }

    let parsed: { data?: { id?: string }[] };
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      console.error('[RESEND] Risposta non JSON:', bodyText);
      return {
        ok: false,
        ids: messages.map(() => null),
        error: `Risposta Resend non interpretabile: ${bodyText}`,
      };
    }

    // data[i] corrisponde al messaggio i del blocco inviato.
    for (let i = 0; i < chunk.length; i++) {
      ids.push(parsed.data?.[i]?.id ?? null);
    }
  }

  return { ok: true, ids, error: null };
}
```

- [ ] **Step 2: Rimuovere l'import di denomailer e la funzione withTimeout**

In `supabase/functions/send-notification/index.ts`, in testa al file, eliminare la riga:

```typescript
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
```

e sostituirla con:

```typescript
import { sendResendBatch, type ResendMessage } from "./resend.ts";
```

Eliminare per intero la funzione `withTimeout` (il blocco di commento che inizia con "Evita che una singola operazione SMTP bloccata uccida il worker" e la funzione che segue). Non serve più: esisteva solo per contenere il problema SMTP.

- [ ] **Step 3: Togliere i campi SMTP dalla select di configurazione del flusso principale**

Alla riga ~674, sostituire:

```typescript
      .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password_encrypted, smtp_from_name, smtp_from_email, email_enabled, email_notifiche_admin')
```

con:

```typescript
      .select('email_enabled, email_notifiche_admin')
```

Lasciare invariato il controllo `if (!config.email_enabled)` subito sotto.

- [ ] **Step 4: Sostituire il blocco "6. CHECK SMTP CONFIG" e "7. DECRYPT PASSWORD"**

Eliminare per intero i due blocchi che vanno dal commento `// 6. CHECK SMTP CONFIG` fino alla chiusura di `new SMTPClient({...})` (righe ~882-903), cioè il controllo `if (!config.smtp_password_encrypted || ...)`, la riga `const password = atob(config.smtp_password_encrypted);` e la creazione del client SMTP. Non vanno sostituiti da nulla.

- [ ] **Step 5: Sostituire il ciclo di invio**

Sostituire il blocco che inizia con `// 8. SEND EMAILS` e termina appena prima di `// Log destinatari scartati` (righe ~905-959) con:

```typescript
    // 8. SEND EMAILS — una sola richiesta HTTP per tutti i destinatari.
    const messages: ResendMessage[] = destinatariDaServire.map((r) => ({
      to: r.email,
      subject: emailSubject,
      html: emailHtml,
      text: emailPlainText,
    }));

    const invio = await sendResendBatch(messages);

    const results = { sent: 0, failed: 0, total: destinatariDaServire.length };
    const logs: Record<string, any>[] = [];

    for (let i = 0; i < destinatariDaServire.length; i++) {
      const recipient = destinatariDaServire[i];
      const inviata = invio.ok && invio.ids[i] !== null;

      if (inviata) {
        results.sent++;
        console.log(`[SEND-EMAIL] ✅ Sent to ${recipient.email}`);
      } else {
        results.failed++;
        console.error(`[SEND-EMAIL] ❌ Failed to ${recipient.email}:`, invio.error);
      }

      logs.push({
        servizio_id: servizio_id,
        template_slug: template_slug,
        template: template_slug,
        recipient_email: recipient.email,
        destinatario: recipient.email,
        subject: emailSubject,
        oggetto: emailSubject,
        sent_at: new Date().toISOString(),
        status: inviata ? 'sent' : 'failed',
        stato: inviata ? 'sent' : 'failed',
        error_message: inviata ? null : invio.error,
        smtp_response: inviata ? 'OK' : invio.error,
        smtp_message_id: invio.ids[i],
      });
    }

    if (logs.length > 0) {
      const { error: logError } = await supabaseAdmin.from('email_logs').insert(logs);
      if (logError) console.error('[SEND-EMAIL] Log save error:', logError);
    }
```

Nota: `smtp_message_id` conserva il nome ma ora contiene l'id restituito da Resend. Rinominarla romperebbe le letture esistenti senza alcun beneficio.

- [ ] **Step 6: Rimuovere la chiusura della connessione SMTP**

Poco più sotto, dopo il blocco che registra i destinatari scartati, eliminare:

```typescript
    // Chiudi la connessione SMTP con timeout: una close bloccata non deve uccidere il worker.
    try {
      await withTimeout(smtp.close(), 5000, 'close');
    } catch (closeErr) {
      console.error('[SEND-EMAIL] SMTP close error (ignorato):', (closeErr as Error).message);
    }
```

- [ ] **Step 7: Verificare che non restino riferimenti SMTP nel flusso principale**

Run:
```bash
grep -n "smtp\.\|SMTPClient\|withTimeout\|smtp_password_encrypted\|smtp_host" supabase/functions/send-notification/index.ts
```
Expected: le uniche occorrenze rimaste riguardano i due rami `test_mode` (Task 2) e il campo `smtp_message_id` / `smtp_response` di `email_logs`. Nessun `SMTPClient`, nessun `withTimeout`.

- [ ] **Step 8: Commit**

```bash
git add supabase/functions/send-notification/resend.ts supabase/functions/send-notification/index.ts
git commit -m "feat(notifiche): invio principale via API Resend invece di SMTP"
```

---

### Task 2: Portare i due rami test_mode su Resend

**Files:**
- Modify: `supabase/functions/send-notification/index.ts` (ramo unificato righe ~488-574; ramo legacy righe ~583-651)

**Interfaces:**
- Consumes: `sendResendBatch(messages: ResendMessage[]): Promise<ResendBatchResult>` dal Task 1.

- [ ] **Step 1: Correggere la guardia del ramo test_mode unificato**

Alla riga ~488 sostituire la select e la guardia:

```typescript
        const { data: smtpCfg } = await supabaseAdmin
          .from('impostazioni')
          .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password_encrypted, smtp_from_name, smtp_from_email, email_enabled')
          .maybeSingle();

        if (!smtpCfg || !smtpCfg.email_enabled || !smtpCfg.smtp_password_encrypted) {
          return new Response(JSON.stringify({ success: false, message: 'SMTP non configurato' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
```

con:

```typescript
        const { data: emailCfg } = await supabaseAdmin
          .from('impostazioni')
          .select('email_enabled')
          .maybeSingle();

        if (!emailCfg || !emailCfg.email_enabled) {
          return new Response(JSON.stringify({ success: false, message: 'Notifiche email disabilitate' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
```

**Questo passo è critico.** La condizione `!smtpCfg.smtp_password_encrypted` bloccherebbe *sempre* l'invio di prova una volta rimosso l'SMTP, e in fase di verifica sembrerebbe un guasto della migrazione invece che una guardia dimenticata.

- [ ] **Step 2: Sostituire l'invio nel ramo test_mode unificato**

Sostituire il blocco che va da `const password = atob(smtpCfg.smtp_password_encrypted);` fino alla `return new Response(...)` inclusa (righe ~535-573) con:

```typescript
        const invio = await sendResendBatch(
          test_emails.map((email: string) => ({
            to: email,
            subject,
            html: rendered.html,
            text: plainText,
          }))
        );

        const sent = invio.ok ? invio.ids.filter((id) => id !== null).length : 0;
        const failed = test_emails.length - sent;

        if (invio.ok) {
          console.log(`[SEND-EMAIL] ✅ Test (${template_slug}) inviato a ${sent} destinatari`);
        } else {
          console.error(`[SEND-EMAIL] ❌ Test (${template_slug}) fallito:`, invio.error);
        }

        return new Response(
          JSON.stringify({
            success: invio.ok,
            sent,
            failed,
            total: test_emails.length,
            template_slug,
            ...(invio.error ? { error: invio.error } : {}),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
```

- [ ] **Step 3: Sostituire la configurazione del ramo test_mode legacy**

Alla riga ~583 sostituire:

```typescript
      const { data: config, error: configError } = await supabaseAdmin
        .from('impostazioni')
        .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password_encrypted, smtp_from_name, smtp_from_email, email_enabled')
        .maybeSingle();

      if (configError || !config) throw new Error(`Config error: ${configError?.message || 'No config found'}`);
      if (!config.email_enabled) {
        return new Response(JSON.stringify({ success: false, message: 'Email disabled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (!config.smtp_password_encrypted || !config.smtp_host || !config.smtp_user) {
        return new Response(JSON.stringify({ success: false, message: 'SMTP not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const password = atob(config.smtp_password_encrypted);
      const smtp = new SMTPClient({
        connection: {
          hostname: config.smtp_host,
          port: config.smtp_port,
          tls: config.smtp_secure,
          auth: { username: config.smtp_user, password }
        }
      });
```

con:

```typescript
      const { data: config, error: configError } = await supabaseAdmin
        .from('impostazioni')
        .select('email_enabled')
        .maybeSingle();

      if (configError || !config) throw new Error(`Config error: ${configError?.message || 'No config found'}`);
      if (!config.email_enabled) {
        return new Response(JSON.stringify({ success: false, message: 'Email disabled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
```

- [ ] **Step 4: Sostituire l'invio nel ramo test_mode legacy**

Lasciare invariati `testHtml` e `testSubject`. Sostituire il ciclo di invio e la chiusura SMTP (righe ~623-651, da `let sent = 0;` fino alla `return new Response(...)` inclusa) con:

```typescript
      const invio = await sendResendBatch(
        test_emails.map((email: string) => ({
          to: email,
          subject: testSubject,
          html: testHtml,
          text: htmlToPlainText(testHtml),
        }))
      );

      const sent = invio.ok ? invio.ids.filter((id) => id !== null).length : 0;
      const failed = test_emails.length - sent;

      if (invio.ok) {
        console.log(`[SEND-EMAIL] ✅ Test inviato a ${sent} destinatari`);
      } else {
        console.error('[SEND-EMAIL] ❌ Test fallito:', invio.error);
      }

      return new Response(
        JSON.stringify({
          success: invio.ok,
          sent,
          failed,
          total: test_emails.length,
          ...(invio.error ? { error: invio.error } : {}),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
```

- [ ] **Step 5: Verificare che l'SMTP sia sparito del tutto**

Run:
```bash
grep -n "SMTPClient\|smtp\.send\|smtp\.close\|withTimeout\|atob(\|smtp_password_encrypted\|smtp_host\|smtp_from_email" supabase/functions/send-notification/index.ts
```
Expected: nessun risultato. Le uniche stringhe contenenti "smtp" ancora presenti devono essere `smtp_message_id` e `smtp_response`, che sono nomi di colonne di `email_logs`.

Run:
```bash
grep -n "smtp_message_id\|smtp_response" supabase/functions/send-notification/index.ts
```
Expected: solo occorrenze dentro la costruzione delle righe di `email_logs`.

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/send-notification/index.ts
git commit -m "feat(notifiche): rami di test su Resend, rimosso ogni residuo SMTP"
```

---

### Task 3: Aggiornare il mittente del reset password

**Files:**
- Modify: `supabase/functions/send-reset-password-email/index.ts:162`

Questa function usa già Resend. Cambia solo il dominio del mittente, ed è **obbligatorio**: quando il secret `RESEND_API_KEY` passa al nuovo account, `taxitime.it` non risulta verificato e la function smette di funzionare.

- [ ] **Step 1: Cambiare il mittente e aggiungere reply_to**

Alla riga 162 sostituire:

```typescript
        from: "TaxiTime <noreply@taxitime.it>",
```

con:

```typescript
        from: "TaxiTime <noreply@taxitime.app>",
        reply_to: "info@taxitime.it",
```

- [ ] **Step 2: Aggiornare il commento che cita il dominio vecchio**

Intorno alla riga 11 il commento parla di `noreply@taxitime.it con SPF/DKIM validi`. Sostituire quel riferimento con `noreply@taxitime.app`, così il commento non contraddice il codice.

- [ ] **Step 3: Verificare che non restino riferimenti al dominio vecchio come mittente**

Run:
```bash
grep -n "taxitime\.it" supabase/functions/send-reset-password-email/index.ts
```
Expected: l'unica occorrenza rimasta è `info@taxitime.it` nel `reply_to`.

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/send-reset-password-email/index.ts
git commit -m "fix(reset-password): mittente su taxitime.app, unico dominio verificato sul nuovo account"
```

---

### Task 4: Sostituire il pannello SMTP e ritirare test-smtp-connection

**Files:**
- Create: `src/components/impostazioni/NotificheEmailForm.tsx`
- Delete: `src/components/impostazioni/SmtpConfigForm.tsx`
- Delete: `supabase/functions/test-smtp-connection/index.ts`
- Modify: `src/components/impostazioni/ImpostazioniForm.tsx:14` (import) e `:274` (montaggio)

- [ ] **Step 1: Creare il nuovo componente**

Creare `src/components/impostazioni/NotificheEmailForm.tsx`:

```tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function NotificheEmailForm() {
  const queryClient = useQueryClient();

  const { data: impostazioni, isLoading } = useQuery({
    queryKey: ["impostazioni"],
    queryFn: async () => {
      const { data, error } = await supabase.from("impostazioni").select("*").single();
      if (error) throw error;
      return data;
    },
  });

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    if (impostazioni) setEmailEnabled(impostazioni.email_enabled ?? true);
  }, [impostazioni]);

  const salvaMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!impostazioni?.id) throw new Error("Impostazioni non trovate");
      const { error } = await supabase
        .from("impostazioni")
        .update({ email_enabled: enabled })
        .eq("id", impostazioni.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Impostazione salvata" });
      queryClient.invalidateQueries({ queryKey: ["impostazioni"] });
    },
    onError: (err: Error) => {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      if (!testEmail) throw new Error("Inserisci l'indirizzo a cui inviare la prova");
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: { test_mode: true, test_emails: [testEmail] },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || data?.message || "Invio non riuscito");
      return data;
    },
    onSuccess: () => {
      toast({ title: `Email di prova inviata a ${testEmail}` });
    },
    onError: (err: Error) => {
      toast({ title: "Invio fallito", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Notifiche email
        </CardTitle>
        <CardDescription>
          Le notifiche vengono inviate tramite Resend dal mittente{" "}
          <strong>noreply@taxitime.app</strong>. Le risposte dei clienti arrivano a{" "}
          <strong>info@taxitime.it</strong>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="email-enabled">Invio delle notifiche attivo</Label>
            <p className="text-sm text-muted-foreground">
              Se disattivato, nessuna notifica parte per nessun servizio.
            </p>
          </div>
          <Switch
            id="email-enabled"
            checked={emailEnabled}
            onCheckedChange={(v) => {
              setEmailEnabled(v);
              salvaMutation.mutate(v);
            }}
            disabled={salvaMutation.isPending}
          />
        </div>

        <div className="space-y-2 border-t pt-6">
          <Label htmlFor="test-email">Invia un'email di prova</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="test-email"
              type="email"
              placeholder="indirizzo@esempio.it"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={testMutation.isPending}
            />
            <Button
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending || !testEmail}
            >
              {testMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Invia prova
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Sostituire il montaggio**

In `src/components/impostazioni/ImpostazioniForm.tsx`, alla riga 14 sostituire:

```tsx
import SmtpConfigForm from "./SmtpConfigForm";
```

con:

```tsx
import NotificheEmailForm from "./NotificheEmailForm";
```

e alla riga ~274 sostituire `<SmtpConfigForm />` con `<NotificheEmailForm />`.

- [ ] **Step 3: Eliminare il vecchio form e la function SMTP**

```bash
git rm src/components/impostazioni/SmtpConfigForm.tsx
git rm -r supabase/functions/test-smtp-connection
```

- [ ] **Step 4: Verificare che non restino riferimenti**

Run:
```bash
grep -rn "SmtpConfigForm\|test-smtp-connection" src/ supabase/
```
Expected: nessun risultato.

- [ ] **Step 5: Controllo dei tipi, lint e build**

Run:
```bash
npx tsc --noEmit
npm run lint
npm run build
```
Expected: `tsc` senza errori; il lint non introduce nuovi errori rispetto alla baseline del branch; la build completa con successo.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/impostazioni supabase/functions
git commit -m "feat(impostazioni): pannello notifiche al posto della configurazione SMTP"
```

---

### Task 5: Rollout e verifica in produzione

Non ci sono ambienti di staging: il progetto `iczxhmzwjopfdvbxwzjs` è la produzione. L'ordine dei passi serve a ridurre al minimo la finestra in cui qualcosa è rotto.

**Perché quest'ordine:** il secret attuale appartiene a un account Resend diverso, dove è verificato `taxitime.it`. Sul nuovo account è verificato solo `taxitime.app`. Non esiste un ordine che eviti del tutto una finestra di disservizio sul reset password: la si tiene di pochi minuti.

- [ ] **Step 1: Salvare la chiave dell'account vecchio**

Dalla dashboard Supabase, in Edge Functions → Secrets, copiare il valore attuale di `RESEND_API_KEY` e conservarlo fuori dal repo. È l'unica via di ritorno se serve tornare a `taxitime.it`: una volta sovrascritto non è più recuperabile.

- [ ] **Step 2: Deploy della function di reset password**

```bash
supabase functions deploy send-reset-password-email --project-ref iczxhmzwjopfdvbxwzjs
```

Da qui e fino allo Step 3 il reset password non funziona: la function chiede `taxitime.app` alla chiave vecchia, che non lo ha verificato. I reset password sono rari; procedere subito con lo step successivo.

- [ ] **Step 3: Sostituire il secret**

Dalla dashboard Supabase, sostituire il valore di `RESEND_API_KEY` con la chiave del nuovo account. Non passare la chiave da riga di comando, per non lasciarla nella cronologia della shell.

- [ ] **Step 4: Verificare il reset password**

Dalla schermata di login dell'applicazione, richiedere un reset password verso un indirizzo di prova. Expected: l'email arriva, il mittente è `noreply@taxitime.app`, il link porta su `taxitime.app`.

Se non arriva:
```bash
supabase functions logs send-reset-password-email --project-ref iczxhmzwjopfdvbxwzjs
```

- [ ] **Step 5: Deploy di send-notification su uno slug canarino**

Prima di toccare lo slug usato dall'applicazione, pubblicare una copia con nome diverso e provarla in isolamento. È l'unico modo, senza Deno in locale, per scoprire errori di sintassi o di tipo prima che tocchino il traffico reale.

```bash
cp -r supabase/functions/send-notification supabase/functions/send-notification-canary
supabase functions deploy send-notification-canary --project-ref iczxhmzwjopfdvbxwzjs
```

Expected: il deploy completa senza errori di bundling.

- [ ] **Step 6: Provare il canarino in test_mode**

Invocare lo slug canarino con un servizio reale e un indirizzo di prova, una volta per ciascuno dei due template principali. Sostituire `<UUID_SERVIZIO>` con l'id di un servizio esistente e `<TUA_EMAIL>` con un indirizzo raggiungibile.

```bash
curl -X POST "https://iczxhmzwjopfdvbxwzjs.supabase.co/functions/v1/send-notification-canary" \
  -H "Authorization: Bearer <JWT_DI_SESSIONE_ADMIN>" \
  -H "Content-Type: application/json" \
  -d '{"test_mode":true,"servizio_id":"<UUID_SERVIZIO>","template_slug":"conferma_presa_carico_completo","test_emails":["<TUA_EMAIL>"]}'
```

Expected: risposta `{"success":true,"sent":1,...}` e arrivo dell'email con oggetto prefissato `[TEST]`, mittente `noreply@taxitime.app`, risposta diretta a `info@taxitime.it`.

Ripetere con `"template_slug":"richiesta_cliente_completo"`.

- [ ] **Step 7: Promuovere e rimuovere il canarino**

```bash
supabase functions deploy send-notification --project-ref iczxhmzwjopfdvbxwzjs
supabase functions delete send-notification-canary --project-ref iczxhmzwjopfdvbxwzjs
rm -r supabase/functions/send-notification-canary
```

- [ ] **Step 8: Verificare su un servizio reale**

Confermare la presa in carico di una richiesta cliente reale dall'applicazione. Expected: il popup compare in 1-2 secondi (non più 5-20), l'email arriva, e in `email_logs` compare una riga per destinatario con `smtp_message_id` valorizzato con l'id di Resend.

- [ ] **Step 9: Controllare i log delle invocazioni**

Interrogare `function_edge_logs` sull'ultima ora. Expected: **nessun 546**, solo `POST | 200`.

Criteri di accettazione della spec da confermare tutti:
1. Nessuna risposta 546.
2. Ogni invocazione produce righe in `email_logs`, `sent` o `failed`.
3. Mittente `noreply@taxitime.app`, risposte a `info@taxitime.it`.
4. Reset password funzionante.
5. Nessun riferimento residuo a `SMTPClient`, `smtp_host`, `test-smtp-connection`.

- [ ] **Step 10: Commit finale e merge**

```bash
git add -A
git commit -m "chore(notifiche): rimozione slug canarino dopo la promozione"
git checkout main
git merge --no-ff feat/notifiche-resend
```

Il push su `main` fa pubblicare il frontend da Vercel: eseguirlo solo dopo che gli step 4, 8 e 9 sono tutti verdi, e solo se Giuseppe lo autorizza esplicitamente.

- [ ] **Step 11: Ruotare le credenziali esposte**

La chiave Resend e il token di accesso Supabase sono stati incollati in chat durante la progettazione. Revocarli e sostituirli:
- Resend: dashboard → API Keys → revoca e ricrea, poi aggiorna il secret su Supabase.
- Supabase: https://supabase.com/dashboard/account/tokens → revoca il token usato per l'analisi.

---

## Fuori scope di questo piano

Interventi già identificati, indipendenti, da pianificare a parte:

- Il popup "CONFERMA DI PRESA IN CARICO INVIATA" viene mostrato sempre, anche quando non parte nulla (`useConfermaPCar.ts`: `sendEmailNotification` inghiotte gli errori, quindi il ramo `toast.warning` è irraggiungibile).
- Il pulsante verde di conferma non ha `disabled` né stato di caricamento (`ServizioSidebar.tsx`, `MobileServizioOptimized.tsx`): un secondo click rilancia l'operazione e può produrre invii doppi.
- Controllo periodico delle notifiche attese rispetto a `email_logs`, con rispedizione dei buchi — la funzione chiesta dal cliente.
- Validazione del formato email nei form dei referenti.
- La migration `20260709120000_fix_id_progressivo_lpad_overflow.sql` è applicata in produzione ma non è committata nel repo.
