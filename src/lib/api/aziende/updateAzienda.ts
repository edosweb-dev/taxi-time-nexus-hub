
import { supabase } from '@/lib/supabase';
import { AziendaFormData } from './types';
import { Azienda } from '@/lib/types';

export async function updateAzienda(id: string, data: Partial<AziendaFormData>): Promise<{ success?: boolean; error?: any }> {
  try {
    console.log('[updateAzienda] Updating company with ID:', id, data);
    
    // If partita IVA is being updated, validate it
    if (data.partita_iva) {
      if (!/^\d{11}$/.test(data.partita_iva)) {
        console.error('[updateAzienda] Invalid partita IVA format');
        return { 
          error: {
            message: 'La partita IVA deve essere di 11 cifre numeriche'
          }
        };
      }
      
      // Check if partita IVA already exists (excluding current record)
      const { data: existingCompany, error: checkError } = await supabase
        .from('aziende')
        .select('id')
        .eq('partita_iva', data.partita_iva)
        .neq('id', id)
        .maybeSingle();
        
      if (checkError) {
        console.error('[updateAzienda] Error checking for existing company:', checkError);
        return { error: checkError };
      }
      
      if (existingCompany) {
        console.error('[updateAzienda] Company with this partita IVA already exists');
        return { 
          error: {
            message: 'Esiste già un\'azienda con questa partita IVA'
          }
        };
      }
    }

    // Update company
    const { data: updatedAzienda, error: updateError } = await supabase
      .from('aziende')
      .update({
        nome: data.nome,
        partita_iva: data.partita_iva,
        email: data.email,
        telefono: data.telefono,
        emails: data.emails,
        telefoni: data.telefoni,
        indirizzo: data.indirizzo,
        citta: data.citta,
        sdi: data.sdi,
        pec: data.pec,
        firma_digitale_attiva: data.firma_digitale_attiva,
        provvigione: data.provvigione,
        provvigione_tipo: data.provvigione_tipo,
        provvigione_valore: data.provvigione_valore
      })
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('[updateAzienda] Error updating company:', updateError);
      return { error: updateError };
    }

    console.log('[updateAzienda] Company updated successfully:', updatedAzienda);
    return { success: true };
  } catch (error) {
    console.error('[updateAzienda] Unexpected error:', error);
    return { error };
  }
}
