import { invokeSendNotificationWithRetry } from '@/lib/api/email/invokeWithRetry';

export type EmailTemplateSlug = 
  | 'servizio_creato' 
  | 'servizio_assegnato' 
  | 'servizio_completato' 
  | 'servizio_annullato' 
  | 'richiesta_cliente' 
  | 'servizio_consuntivato'
  | 'richiesta_cliente_completo'
  | 'conferma_presa_carico_completo'
  | 'servizio_confermato_completo';

export interface EsitoNotifica {
  /** true solo se la notifica e' davvero partita. */
  success: boolean;
  /** Motivo del fallimento, quando disponibile. */
  error?: string;
}

/**
 * Invia notifica email per un servizio tramite la Edge Function `send-notification`.
 *
 * **Non lancia mai**: diversi chiamanti la invocano senza `await` e senza `catch`,
 * e contano su questa garanzia. Chi ha bisogno di sapere com'e' andata legge il
 * valore restituito, invece di dedurlo dall'assenza di un'eccezione: gli errori
 * venivano inghiottiti qui dentro, quindi il ramo `catch` dei chiamanti non si
 * attivava mai e l'interfaccia dichiarava l'invio riuscito anche quando non era
 * partito nulla.
 */
export async function sendEmailNotification(
  servizioId: string,
  templateSlug: EmailTemplateSlug
): Promise<EsitoNotifica> {
  try {
    console.log('[sendEmailNotification] Sending:', { servizioId, templateSlug });

    const result = await invokeSendNotificationWithRetry(servizioId, templateSlug);
    console.log('[sendEmailNotification] Result:', result);

    // I guasti di trasporto arrivano in `error`, quelli applicativi della edge
    // function (notifiche disabilitate, nessun destinatario, template assente)
    // in `message`: senza il fallback il motivo andrebbe perso proprio nei casi
    // in cui serve capire perche' la notifica non e' partita.
    return { success: result.success === true, error: result.error ?? result.message };
  } catch (err) {
    const messaggio = err instanceof Error ? err.message : String(err);
    console.error('[sendEmailNotification] Exception:', err);
    return { success: false, error: messaggio };
  }
}
