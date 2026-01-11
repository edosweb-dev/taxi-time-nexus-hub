
import { supabase } from '@/lib/supabase';
import { AziendaFormData } from './types';
import { Azienda } from '@/lib/types';

export async function createAzienda(data: AziendaFormData): Promise<{ azienda?: Azienda; error?: any }> {
  try {
    console.log('[createAzienda] Creating new company:', data);
    
    // Validate VAT number (Partita IVA)
    if (!data.partita_iva || !/^\d{11}$/.test(data.partita_iva)) {
      console.error('[createAzienda] Invalid partita IVA format');
      return { 
        error: {
          message: 'La partita IVA deve essere di 11 cifre numeriche'
        }
      };
    }
    
    // Check if partita IVA already exists
    const { data: existingCompany, error: checkError } = await supabase
      .from('aziende')
      .select('id')
      .eq('partita_iva', data.partita_iva)
      .maybeSingle();
      
    if (checkError) {
      console.error('[createAzienda] Error checking for existing company:', checkError);
      return { error: checkError };
    }
    
    if (existingCompany) {
      console.error('[createAzienda] Company with this partita IVA already exists');
      return { 
        error: {
          message: 'Esiste già un\'azienda con questa partita IVA'
        }
      };
    }

    // Create company
    const { data: newAzienda, error: createError } = await supabase
      .from('aziende')
      .insert([{
        nome: data.nome,
        partita_iva: data.partita_iva,
        email: data.email || null,
        telefono: data.telefono || null,
        emails: data.emails || [],
        telefoni: data.telefoni || [],
        indirizzo: data.indirizzo || null,
        citta: data.citta || null,
        sdi: data.sdi || null,
        pec: data.pec || null,
        firma_digitale_attiva: data.firma_digitale_attiva || false,
        provvigione: data.provvigione || false,
        provvigione_tipo: data.provvigione_tipo || null,
        provvigione_valore: data.provvigione_valore || null
      }])
      .select()
      .single();

    if (createError) {
      console.error('[createAzienda] Error creating company:', createError);
      return { error: createError };
    }

    console.log('[createAzienda] Company created successfully:', newAzienda);
    return { azienda: newAzienda as Azienda };
  } catch (error) {
    console.error('[createAzienda] Unexpected error:', error);
    return { error };
  }
}
