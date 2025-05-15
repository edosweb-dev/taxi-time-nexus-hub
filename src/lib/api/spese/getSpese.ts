
import { supabase } from "@/lib/supabase";
import { SpesaPersonale, GetSpeseOptions } from "@/lib/types/spese";

export const getSpese = async (options?: GetSpeseOptions): Promise<SpesaPersonale[]> => {
  try {
    let query = supabase
      .from('spese_personali')
      .select('*, user:profiles(id, first_name, last_name, role)')
      .order('data', { ascending: false });

    // Apply filters if provided
    if (options) {
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options.dateFrom) {
        query = query.gte('data', options.dateFrom);
      }
      if (options.dateTo) {
        query = query.lte('data', options.dateTo);
      }
      if (options.minImporto !== undefined && options.minImporto !== null) {
        query = query.gte('importo', options.minImporto);
      }
      if (options.maxImporto !== undefined && options.maxImporto !== null) {
        query = query.lte('importo', options.maxImporto);
      }
      if (options.causale) {
        query = query.ilike('causale', `%${options.causale}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching spese:', error);
    throw error;
  }
};
