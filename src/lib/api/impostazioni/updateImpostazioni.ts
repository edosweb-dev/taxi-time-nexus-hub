
import { supabase } from '@/lib/supabase';
import { Impostazioni, UpdateImpostazioniRequest } from './types';

export async function updateImpostazioni(request: UpdateImpostazioniRequest): Promise<Impostazioni | null> {
  try {
    const { data, error } = await supabase
      .from('impostazioni')
      .update({
        ...request.impostazioni,
        metodi_pagamento: request.impostazioni.metodi_pagamento,
        aliquote_iva: request.impostazioni.aliquote_iva,
      })
      .eq('id', (await supabase.from('impostazioni').select('id').maybeSingle()).data?.id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[updateImpostazioni] Error updating impostazioni:', error);
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
    console.error('[updateImpostazioni] Unexpected error:', error);
    throw error;
  }
}
