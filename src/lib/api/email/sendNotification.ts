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

/**
 * Invia notifica email per un servizio tramite Edge Function SMTP.
 * Fire-and-forget: non blocca mai il flusso principale.
 */
export async function sendEmailNotification(
  servizioId: string,
  templateSlug: EmailTemplateSlug
): Promise<void> {
  try {
    console.log('[sendEmailNotification] Sending:', { servizioId, templateSlug });

    const result = await invokeSendNotificationWithRetry(servizioId, templateSlug);
    console.log('[sendEmailNotification] Result:', result);
  } catch (err) {
    console.error('[sendEmailNotification] Exception:', err);
    // Fail silently - email is not critical
  }
}
