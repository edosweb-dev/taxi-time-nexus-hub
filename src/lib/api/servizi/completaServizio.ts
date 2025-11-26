
import { supabase } from '@/lib/supabase';
import { MetodoPagamento } from '@/lib/types/servizi';
import { getTipoPagamento, TipoPagamento } from '@/lib/types/servizi/metodoPagamentoHelpers';

interface CompletaServizioParams {
  id: string;
  metodo_pagamento: MetodoPagamento;
  incasso_ricevuto?: number;
  consegna_contanti_a?: string;
}

export async function completaServizio({
  id,
  metodo_pagamento,
  incasso_ricevuto,
  consegna_contanti_a,
}: CompletaServizioParams) {
  try {
    const tipoPagamento = getTipoPagamento(metodo_pagamento);
    
    // Validazione condizionale basata sul tipo di pagamento
    if (tipoPagamento === TipoPagamento.CONTANTI_UBER || tipoPagamento === TipoPagamento.CARTA) {
      if (!incasso_ricevuto || incasso_ricevuto <= 0) {
        throw new Error(
          `Incasso ricevuto obbligatorio per pagamenti con ${metodo_pagamento}`
        );
      }
    }
    
    // consegna_contanti_a gestito in fase di consuntivazione

    const updateData: any = {
      stato: 'completato',
      metodo_pagamento,
    };

    // Aggiungi campi incasso SOLO se metodo lo richiede (escludi Bonifico)
    if (tipoPagamento !== TipoPagamento.DIRETTO_AZIENDA) {
      updateData.incasso_ricevuto = incasso_ricevuto;
    }
    
    // consegna_contanti_a gestito solo in fase di consuntivazione
    // Per bonifici: incasso_ricevuto rimane NULL (popolato in consuntivazione)

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
