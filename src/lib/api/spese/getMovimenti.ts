
import { supabase } from "@/lib/supabase";
import { MovimentoAziendale, MovimentoTipo, MovimentoStato } from "@/lib/types/spese";

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
        metodo_pagamento:metodi_pagamento_spese(id, nome, descrizione, created_at)
      `)
      .order('data', { ascending: false });

    // Apply filters if provided
    if (options) {
      if (options.tipo) {
        // Validate tipo before using it in query
        const validTipi: MovimentoTipo[] = ['spesa', 'incasso', 'prelievo'];
        if (validTipi.includes(options.tipo as MovimentoTipo)) {
          query = query.eq('tipo', options.tipo as MovimentoTipo);
        }
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
        // Validate stato before using it in query
        const validStati: MovimentoStato[] = ['saldato', 'pending'];
        if (validStati.includes(options.stato as MovimentoStato)) {
          query = query.eq('stato', options.stato as MovimentoStato);
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Process and transform the data to match the MovimentoAziendale type
    const movimenti: MovimentoAziendale[] = data?.map(item => {
      const movimento: MovimentoAziendale = {
        ...item,
        tipo: item.tipo as MovimentoTipo,
        stato: item.stato as MovimentoStato,
        // Handle potential null/undefined values safely
        effettuato_da: item.effettuato_da && typeof item.effettuato_da === 'object' && 'id' in item.effettuato_da ? item.effettuato_da : null,
        metodo_pagamento: item.metodo_pagamento && typeof item.metodo_pagamento === 'object' ? {
          id: item.metodo_pagamento.id,
          nome: item.metodo_pagamento.nome,
          descrizione: item.metodo_pagamento.descrizione,
          created_at: item.metodo_pagamento.created_at || new Date().toISOString()
        } : undefined
      };
      return movimento;
    }) || [];

    return movimenti;
  } catch (error) {
    console.error('Error fetching movimenti:', error);
    throw error;
  }
};
