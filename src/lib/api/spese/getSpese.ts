
import { supabase } from '@/lib/supabase';
import { SpesaPersonale } from '@/lib/types/spese';
import { GetSpeseOptions, GetSpeseResponse } from './types';

export async function getSpese(
  options?: GetSpeseOptions
): Promise<GetSpeseResponse> {
  try {
    let query = supabase.from('spese_personali').select('*', { count: 'exact' });

    // Add filters if provided
    if (options?.startDate) {
      query = query.gte('data', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('data', options.endDate);
    }

    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }

    // Order by date, descending
    query = query.order('data', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching spese:', error);
      return { data: [], count: 0, error };
    }

    return {
      data: data as SpesaPersonale[],
      count: count || 0,
      error: null,
    };
  } catch (error: any) {
    console.error('Unexpected error fetching spese:', error);
    return {
      data: [],
      count: 0,
      error,
    };
  }
}
