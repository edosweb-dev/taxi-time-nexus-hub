
import { supabase } from '@/lib/supabase';
import { MetodoPagamento, richiedeGestioneIncasso } from '@/lib/types/servizi';

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
    // Validazione condizionale: incasso richiesto SOLO per Contanti/Carta
    const richiedeIncasso = richiedeGestioneIncasso(metodo_pagamento);
    
    if (richiedeIncasso) {
      if (!incasso_ricevuto || incasso_ricevuto <= 0) {
        throw new Error(
          `Incasso ricevuto obbligatorio per pagamenti con ${metodo_pagamento}`
        );
      }
      
      if (!consegna_contanti_a) {
        throw new Error('Devi indicare a chi consegnare i contanti');
      }
    }

    const updateData: any = {
      stato: 'completato',
      metodo_pagamento,
    };

    // Aggiungi campi incasso SOLO se metodo lo richiede
    if (richiedeIncasso) {
      updateData.incasso_ricevuto = incasso_ricevuto;
      updateData.consegna_contanti_a = consegna_contanti_a;
    }
    // Per bonifici: incasso_ricevuto e consegna_contanti_a rimangono NULL
    // (incasso sarà popolato dall'admin in consuntivazione)

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
