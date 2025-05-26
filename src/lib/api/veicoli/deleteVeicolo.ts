
import { supabase } from '@/lib/supabase';

export async function deleteVeicolo(id: string): Promise<void> {
  try {
    console.log('[deleteVeicolo] Deleting veicolo:', id);

    // Invece di eliminare, disattiviamo il veicolo
    const { error } = await supabase
      .from('veicoli')
      .update({ attivo: false })
      .eq('id', id);

    if (error) {
      console.error('[deleteVeicolo] Error deactivating veicolo:', error);
      throw error;
    }

    console.log('[deleteVeicolo] Veicolo deactivated successfully');
  } catch (error) {
    console.error('[deleteVeicolo] Unexpected error:', error);
    throw error;
  }
}
