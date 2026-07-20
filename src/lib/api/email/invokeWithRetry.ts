import { supabase } from '@/integrations/supabase/client';

const MAX_TENTATIVI = 3;
const ATTESA_MS = [800, 2500]; // attesa prima del 2o e del 3o tentativo

/**
 * Invoca `send-notification` ritentando quando il worker viene terminato
 * (HTTP 546, CPU Time exceeded). Dal secondo tentativo passa `skip_already_sent`,
 * cosi' i destinatari gia' serviti dal tentativo precedente non ricevono doppioni.
 *
 * Ritenta solo sui guasti di trasporto: un `success: false` applicativo
 * (template inesistente, nessun destinatario, email disabilitate) e' definitivo.
 */
export async function invokeSendNotificationWithRetry(
  servizioId: string,
  templateSlug: string
): Promise<{ success: boolean; sent?: number; failed?: number; message?: string; error?: string }> {
  let ultimoErrore = '';

  for (let tentativo = 1; tentativo <= MAX_TENTATIVI; tentativo++) {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          servizio_id: servizioId,
          template_slug: templateSlug,
          skip_already_sent: tentativo > 1,
        },
      });

      if (!error) {
        if (tentativo > 1) console.log(`[sendNotification] Riuscito al tentativo ${tentativo}`, data);
        return { success: true, ...(data || {}) };
      }

      ultimoErrore = error.message || String(error);

      // 401/403 sono definitivi quanto un `success: false` applicativo: la
      // function ora autentica il chiamante, e un token assente o scaduto non
      // migliora ritentando. Evita 3 richieste inutili e 3,3s di attese.
      const status = (error as { context?: { status?: number } })?.context?.status;
      if (status === 401 || status === 403) {
        console.error(`[sendNotification] Autenticazione rifiutata (${status}), nessun ritentativo:`, ultimoErrore);
        return { success: false, error: ultimoErrore };
      }

      console.warn(`[sendNotification] Tentativo ${tentativo}/${MAX_TENTATIVI} fallito:`, ultimoErrore);
    } catch (err: any) {
      ultimoErrore = err?.message || String(err);
      console.warn(`[sendNotification] Tentativo ${tentativo}/${MAX_TENTATIVI} eccezione:`, ultimoErrore);
    }

    if (tentativo < MAX_TENTATIVI) {
      await new Promise(r => setTimeout(r, ATTESA_MS[tentativo - 1]));
    }
  }

  console.error(`[sendNotification] Falliti tutti i ${MAX_TENTATIVI} tentativi:`, ultimoErrore);
  return { success: false, error: ultimoErrore };
}
