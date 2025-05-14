
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

    return data;
  } catch (error) {
    console.error('[getImpostazioni] Unexpected error:', error);
    throw error;
  }
}
