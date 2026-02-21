import { supabase } from '@/lib/supabase';

export type EmailTemplateSlug = 
  | 'servizio_creato' 
  | 'servizio_assegnato' 
  | 'servizio_completato' 
  | 'servizio_annullato' 
  | 'richiesta_cliente' 
  | 'servizio_consuntivato';

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

    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: {
        servizio_id: servizioId,
        template_slug: templateSlug
      }
    });

    if (error) {
      console.error('[sendEmailNotification] Error:', error);
      return;
    }

    console.log('[sendEmailNotification] Result:', data);
  } catch (err) {
    console.error('[sendEmailNotification] Exception:', err);
    // Fail silently - email is not critical
  }
}
