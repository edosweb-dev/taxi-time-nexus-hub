
import { supabase } from '@/lib/supabase';
import { MetodoPagamento, richiedeGestioneIncasso } from '@/lib/types/servizi';

interface CompletaServizioParams {
  id: string;
  metodo_pagamento: MetodoPagamento;
  incasso_ricevuto?: number;
}

export async function completaServizio({
  id,
  metodo_pagamento,
  incasso_ricevuto,
}: CompletaServizioParams) {
  try {
    // Validazione condizionale: incasso richiesto SOLO per Contanti/Carta
    const richiedeIncasso = richiedeGestioneIncasso(metodo_pagamento);
    
    if (richiedeIncasso && (!incasso_ricevuto || incasso_ricevuto <= 0)) {
      throw new Error(
        `Incasso ricevuto obbligatorio per pagamenti con ${metodo_pagamento}`
      );
    }

    const updateData: any = {
      stato: 'completato',
      metodo_pagamento,
    };

    // Aggiungi incasso SOLO se metodo lo richiede
    if (richiedeIncasso && incasso_ricevuto) {
      updateData.incasso_ricevuto = incasso_ricevuto;
    }

    const { data, error } = await supabase
      .from('servizi')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('[completaServizio] Error:', error);
    return { data: null, error };
  }
}
