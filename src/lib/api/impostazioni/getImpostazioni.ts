
import { supabase } from '@/lib/supabase';
import { Impostazioni } from './types';

export async function getImpostazioni(): Promise<Impostazioni | null> {
  try {
    const { data, error } = await supabase
      .from('impostazioni')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[getImpostazioni] Error fetching impostazioni:', error);
      throw error;
    }

    if (data) {
      // Convert JSON data to typed arrays
      return {
        ...data,
        metodi_pagamento: Array.isArray(data.metodi_pagamento) ? data.metodi_pagamento : [],
        aliquote_iva: Array.isArray(data.aliquote_iva) ? data.aliquote_iva : []
      };
    }

    return null;
  } catch (error) {
    console.error('[getImpostazioni] Unexpected error:', error);
    throw error;
  }
}
