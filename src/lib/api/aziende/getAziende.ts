
import { supabase } from '@/lib/supabase';
import { Azienda } from '@/lib/types';

export async function getAziende(): Promise<Azienda[]> {
  try {
    console.log('[getAziende] Fetching companies from Supabase');
    const { data, error } = await supabase
      .from('aziende')
      .select('*')
      .order('nome');

    if (error) {
      console.error('[getAziende] Error fetching companies:', error);
      throw error;
    }

    console.log(`[getAziende] Successfully fetched ${data.length} companies`);
    return data as Azienda[];
  } catch (error) {
    console.error('[getAziende] Unexpected error:', error);
    throw error;
  }
}

export async function getAziendaById(id: string): Promise<Azienda | null> {
  try {
    console.log(`[getAziendaById] Fetching company with ID: ${id}`);
    const { data, error } = await supabase
      .from('aziende')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`[getAziendaById] Company with ID ${id} not found`);
        return null;
      }
      console.error('[getAziendaById] Error fetching company:', error);
      throw error;
    }

    console.log('[getAziendaById] Successfully fetched company:', data);
    return data as Azienda;
  } catch (error) {
    console.error('[getAziendaById] Unexpected error:', error);
    throw error;
  }
}
