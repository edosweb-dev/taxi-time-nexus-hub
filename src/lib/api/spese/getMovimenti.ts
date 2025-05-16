
import { supabase } from '@/lib/supabase';
import { MovimentoAziendale } from '@/lib/types/spese';
import { GetMovimentiOptions, GetMovimentiResponse } from './types';

export async function getMovimenti(
  options?: GetMovimentiOptions
): Promise<GetMovimentiResponse> {
  try {
    let query = supabase.from('movimenti_aziendali').select('*', { count: 'exact' });

    // Add filters if provided
    if (options?.startDate) {
      query = query.gte('data', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('data', options.endDate);
    }

    if (options?.tipo) {
      query = query.eq('tipo', options.tipo);
    }

    if (options?.stato) {
      query = query.eq('stato', options.stato);
    }

    // Order by date, descending
    query = query.order('data', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching movimenti:', error);
      return { data: [], count: 0, error };
    }

    return {
      data: data as MovimentoAziendale[],
      count: count || 0,
      error: null,
    };
  } catch (error: any) {
    console.error('Unexpected error fetching movimenti:', error);
    return {
      data: [],
      count: 0,
      error,
    };
  }
}
