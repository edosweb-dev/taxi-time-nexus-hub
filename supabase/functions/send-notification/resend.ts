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
  /** true solo se OGNI blocco e' stato inviato senza errori. Un batch puo'
   *  fallire parzialmente (es. un blocco su piu' va in errore): in quel caso
   *  ok e' false ma ids puo' comunque contenere id validi per i destinatari
   *  dei blocchi riusciti prima del fallimento. Il chiamante deve decidere
   *  l'esito per destinatario da ids[i] !== null, non da ok.
   */
  ok: boolean;
  /** Un elemento per messaggio, nello stesso ordine dell'input. null se non inviato. */
  ids: (string | null)[];
  /** Messaggio d'errore leggibile, null se tutto ok. */
  error: string | null;
}

// Impronta deterministica del contenuto. Non e' crittografia: serve solo a far
// cambiare la chiave di idempotenza quando cambia il testo della mail, cosi' un
// rinvio dopo una correzione non viene rifiutato da Resend con 409.
function hashContenuto(...parti: string[]): string {
  const s = parti.join(' ');
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
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

export async function sendResendBatch(
  messages: ResendMessage[],
  idempotencyScope?: string
): Promise<ResendBatchResult> {
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

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    if (idempotencyScope) {
      const finestra = Math.floor(Date.now() / (10 * 60 * 1000));
      const impronta = hashContenuto(chunk[0].subject, chunk[0].html);
      const indiceBlocco = Math.floor(start / MAX_PER_REQUEST);
      headers['Idempotency-Key'] = `${idempotencyScope}:${indiceBlocco}:${finestra}:${impronta}`;
    }

    let response: Response;
    try {
      response = await fetch(RESEND_BATCH_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildBatchPayload(chunk)),
      });
    } catch (err) {
      const message = (err as Error).message;
      console.error('[RESEND] Chiamata fallita:', message);
      // Preserva gli id gia' raccolti dai blocchi precedenti andati a buon
      // fine; questo blocco e quelli non ancora tentati diventano null.
      while (ids.length < messages.length) ids.push(null);
      return {
        ok: false,
        ids,
        error: `Chiamata a Resend fallita: ${message}`,
      };
    }

    const bodyText = await response.text();

    if (!response.ok) {
      console.error(`[RESEND] HTTP ${response.status}:`, bodyText);
      while (ids.length < messages.length) ids.push(null);
      return {
        ok: false,
        ids,
        error:
          response.status === 409
            ? `Resend HTTP 409 (richiesta duplicata o gia' in corso): ${bodyText}`
            : `Resend HTTP ${response.status}: ${bodyText}`,
      };
    }

    let parsed: { data?: { id?: string }[] };
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      console.error('[RESEND] Risposta non JSON:', bodyText);
      while (ids.length < messages.length) ids.push(null);
      return {
        ok: false,
        ids,
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
