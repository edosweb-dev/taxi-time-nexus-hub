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
