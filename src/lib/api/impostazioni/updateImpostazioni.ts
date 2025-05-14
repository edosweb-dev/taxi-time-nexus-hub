
import { supabase } from '@/lib/supabase';
import { Impostazioni, UpdateImpostazioniRequest } from './types';

export async function updateImpostazioni(request: UpdateImpostazioniRequest): Promise<Impostazioni | null> {
  try {
    const { data, error } = await supabase
      .from('impostazioni')
      .update(request.impostazioni)
      .eq('id', (await supabase.from('impostazioni').select('id').maybeSingle()).data?.id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[updateImpostazioni] Error updating impostazioni:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('[updateImpostazioni] Unexpected error:', error);
    throw error;
  }
}
