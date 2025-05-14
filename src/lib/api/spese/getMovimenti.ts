
import { supabase } from "@/lib/supabase";
import { MovimentoAziendale } from "@/lib/types/spese";

export interface GetMovimentiOptions {
  tipo?: string;
  dateFrom?: string;
  dateTo?: string;
  minImporto?: number;
  maxImporto?: number;
  causale?: string;
  userId?: string;
  stato?: string;
}

export const getMovimenti = async (options?: GetMovimentiOptions): Promise<MovimentoAziendale[]> => {
  try {
    let query = supabase
      .from('movimenti_aziendali')
      .select(`
        *,
        effettuato_da:profiles(id, first_name, last_name, role),
        metodo_pagamento:metodi_pagamento_spese(id, nome, descrizione)
      `)
      .order('data', { ascending: false });

    // Apply filters if provided
    if (options) {
      if (options.tipo) {
        query = query.eq('tipo', options.tipo);
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
      if (options.userId) {
        query = query.eq('effettuato_da_id', options.userId);
      }
      if (options.stato) {
        query = query.eq('stato', options.stato);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching movimenti:', error);
    throw error;
  }
};
