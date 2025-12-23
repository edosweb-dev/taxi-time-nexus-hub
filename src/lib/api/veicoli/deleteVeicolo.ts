import { supabase } from '@/lib/supabase';

/**
 * Disattiva un veicolo (soft delete)
 */
export async function deactivateVeicolo(id: string): Promise<void> {
  console.log('[deactivateVeicolo] Deactivating veicolo:', id);

  const { error } = await supabase
    .from('veicoli')
    .update({ attivo: false })
    .eq('id', id);

  if (error) {
    console.error('[deactivateVeicolo] Error:', error);
    throw error;
  }

  console.log('[deactivateVeicolo] Veicolo deactivated successfully');
}

/**
 * Riattiva un veicolo
 */
export async function reactivateVeicolo(id: string): Promise<void> {
  console.log('[reactivateVeicolo] Reactivating veicolo:', id);

  const { error } = await supabase
    .from('veicoli')
    .update({ attivo: true })
    .eq('id', id);

  if (error) {
    console.error('[reactivateVeicolo] Error:', error);
    throw error;
  }

  console.log('[reactivateVeicolo] Veicolo reactivated successfully');
}

/**
 * Elimina definitivamente un veicolo (hard delete)
 * Solo per veicoli inattivi - admin e socio
 */
export async function hardDeleteVeicolo(id: string): Promise<void> {
  console.log('[hardDeleteVeicolo] Hard deleting veicolo:', id);

  const { error } = await supabase
    .from('veicoli')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[hardDeleteVeicolo] Error:', error);
    throw error;
  }

  console.log('[hardDeleteVeicolo] Veicolo deleted permanently');
}

// Alias per retrocompatibilità
export const deleteVeicolo = deactivateVeicolo;
