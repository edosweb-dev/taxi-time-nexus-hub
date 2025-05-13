
import { supabase } from '@/lib/supabase';

interface UpdateFirmaServizioParams {
  id: string;
  firma_url: string;
  firma_timestamp: string;
}

export async function updateFirmaServizio({ id, firma_url, firma_timestamp }: UpdateFirmaServizioParams) {
  try {
    const { data, error } = await supabase
      .from('servizi')
      .update({ 
        firma_url, 
        firma_timestamp 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('[updateFirmaServizio] Error:', error);
    return { data: null, error };
  }
}
