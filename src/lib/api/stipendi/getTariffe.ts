
import { supabase } from '@/lib/supabase';
import { TariffaKm, ConfigurazioneStipendi } from './types';

export async function getTariffeKm(anno?: number): Promise<TariffaKm[]> {
  try {
    console.log('[getTariffeKm] Fetching tariffe for anno:', anno);

    let query = supabase
      .from('tariffe_km')
      .select('*')
      .order('km', { ascending: true });

    if (anno) {
      query = query.eq('anno', anno);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getTariffeKm] Error:', error);
      throw error;
    }

    console.log(`[getTariffeKm] Found ${data?.length || 0} tariffe`);
    return data || [];
  } catch (error) {
    console.error('[getTariffeKm] Error fetching tariffe:', error);
    throw error;
  }
}

export async function getConfigurazioneStipendi(anno: number): Promise<ConfigurazioneStipendi | null> {
  try {
    console.log('[getConfigurazioneStipendi] Fetching config for anno:', anno);

    const { data, error } = await supabase
      .from('configurazione_stipendi')
      .select('*')
      .eq('anno', anno)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        console.log('[getConfigurazioneStipendi] No configuration found for anno:', anno);
        return null;
      }
      console.error('[getConfigurazioneStipendi] Error:', error);
      throw error;
    }

    console.log('[getConfigurazioneStipendi] Found configuration');
    return data;
  } catch (error) {
    console.error('[getConfigurazioneStipendi] Error fetching configuration:', error);
    throw error;
  }
}
