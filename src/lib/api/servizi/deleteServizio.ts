import { supabase } from '@/lib/supabase';

/**
 * Elimina fisicamente un servizio e tutti i suoi record correlati
 * ⚠️ ATTENZIONE: Questa operazione è IRREVERSIBILE
 * Solo per Admin e Socio
 */
export async function deleteServizio(id: string): Promise<void> {
  console.log('[deleteServizio] Starting hard delete for service:', id);

  try {
    // STEP 1: Elimina servizi_passeggeri
    console.log('[deleteServizio] Deleting servizi_passeggeri...');
    const { error: passeggeriError } = await supabase
      .from('servizi_passeggeri')
      .delete()
      .eq('servizio_id', id);

    if (passeggeriError) {
      console.error('[deleteServizio] Error deleting passeggeri:', passeggeriError);
      throw new Error(`Errore eliminazione passeggeri: ${passeggeriError.message}`);
    }

    // STEP 2: Elimina servizi_email_notifiche
    console.log('[deleteServizio] Deleting servizi_email_notifiche...');
    const { error: emailError } = await supabase
      .from('servizi_email_notifiche')
      .delete()
      .eq('servizio_id', id);

    if (emailError) {
      console.error('[deleteServizio] Error deleting email notifiche:', emailError);
      throw new Error(`Errore eliminazione email notifiche: ${emailError.message}`);
    }

    // STEP 3: Elimina il servizio
    console.log('[deleteServizio] Deleting servizio...');
    const { error: servizioError } = await supabase
      .from('servizi')
      .delete()
      .eq('id', id);

    if (servizioError) {
      console.error('[deleteServizio] Error deleting servizio:', servizioError);
      throw new Error(`Errore eliminazione servizio: ${servizioError.message}`);
    }

    console.log('[deleteServizio] ✅ Hard delete completed successfully');
  } catch (error) {
    console.error('[deleteServizio] ❌ Hard delete failed:', error);
    throw error;
  }
}
