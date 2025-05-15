
import { supabase } from "@/lib/supabase";
import { MovimentoAziendale, MovimentoTipo, MovimentoStato } from "@/lib/types/spese";

interface GetMovimentiOptions {
  tipo?: MovimentoTipo;
  daData?: string;
  aData?: string;
  stato?: MovimentoStato;
  effettuatoDaId?: string;
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

    // Apply filters
    if (options) {
      if (options.tipo) {
        query = query.eq('tipo', options.tipo);
      }
      
      if (options.daData) {
        query = query.gte('data', options.daData);
      }
      
      if (options.aData) {
        query = query.lte('data', options.aData);
      }
      
      if (options.stato) {
        query = query.eq('stato', options.stato);
      }
      
      if (options.effettuatoDaId) {
        query = query.eq('effettuato_da_id', options.effettuatoDaId);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data) {
      return [];
    }

    // Transform data to ensure it conforms to MovimentoAziendale type
    const movimenti: MovimentoAziendale[] = data.map(item => {
      // Safely handle fields that might be different from expected types
      const movimento: MovimentoAziendale = {
        ...item,
        tipo: item.tipo as MovimentoTipo,
        stato: item.stato as MovimentoStato | null,
        // Handle potential null/undefined values safely
        effettuato_da: item.effettuato_da && typeof item.effettuato_da === 'object' && 'id' in item.effettuato_da 
          ? item.effettuato_da 
          : null,
        metodo_pagamento: item.metodo_pagamento && typeof item.metodo_pagamento === 'object' && 'id' in item.metodo_pagamento
          ? {
              id: item.metodo_pagamento.id,
              nome: item.metodo_pagamento.nome,
              descrizione: item.metodo_pagamento.descrizione || null,
              created_at: item.metodo_pagamento.created_at
            }
          : undefined
      };
      return movimento;
    });

    return movimenti;
  } catch (error) {
    console.error('Error fetching movimenti:', error);
    throw error;
  }
};
