
import { supabase } from '@/lib/supabase';
import { MetodoPagamento } from '@/lib/types/servizi';

interface CompletaServizioParams {
  id: string;
  metodo_pagamento: MetodoPagamento;
  incasso_ricevuto?: number;
  ore_lavorate?: number;
}

export async function completaServizio({
  id,
  metodo_pagamento,
  incasso_ricevuto,
  ore_lavorate,
}: CompletaServizioParams) {
  try {
    const { data, error } = await supabase
      .from('servizi')
      .update({
        stato: 'completato',
        metodo_pagamento,
        incasso_ricevuto,
        ore_lavorate,
      })
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
