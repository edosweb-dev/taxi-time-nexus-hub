
import { supabase } from '@/lib/supabase';
import { Stipendio, TipoCalcolo } from './types';

export async function getStipendi(filters?: {
  anno?: number;
  mese?: number;
  user_id?: string;
  tipo_calcolo?: string;
}): Promise<Stipendio[]> {
  try {
    console.log('[getStipendi] Fetching stipendi with filters:', filters);

    let query = supabase
      .from('stipendi')
      .select(`
        *,
        user:profiles!stipendi_user_id_fkey (
          first_name,
          last_name,
          role
        )
      `)
      .order('anno', { ascending: false })
      .order('mese', { ascending: false });

    if (filters?.anno) {
      query = query.eq('anno', filters.anno);
    }
    if (filters?.mese) {
      query = query.eq('mese', filters.mese);
    }
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters?.tipo_calcolo) {
      query = query.eq('tipo_calcolo', filters.tipo_calcolo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getStipendi] Error:', error);
      throw error;
    }

    console.log(`[getStipendi] Found ${data?.length || 0} stipendi`);
    
    // Cast esplicito del tipo_calcolo per ogni elemento
    return data?.map(item => ({
      ...item,
      tipo_calcolo: item.tipo_calcolo as TipoCalcolo
    })) || [];
  } catch (error) {
    console.error('[getStipendi] Error fetching stipendi:', error);
    throw error;
  }
}

export async function getStipendioById(id: string): Promise<Stipendio | null> {
  try {
    console.log('[getStipendioById] Fetching stipendio:', id);

    const { data, error } = await supabase
      .from('stipendi')
      .select(`
        *,
        user:profiles!stipendi_user_id_fkey (
          first_name,
          last_name,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('[getStipendioById] Error:', error);
      throw error;
    }

    console.log('[getStipendioById] Found stipendio');
    
    // Cast esplicito del tipo_calcolo per il singolo elemento
    return {
      ...data,
      tipo_calcolo: data.tipo_calcolo as TipoCalcolo
    };
  } catch (error) {
    console.error('[getStipendioById] Error fetching stipendio:', error);
    throw error;
  }
}
