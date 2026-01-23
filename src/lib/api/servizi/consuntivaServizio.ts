
import { supabase } from '@/lib/supabase';

interface ConsuntivaServizioParams {
  id: string;
  incasso_ricevuto?: number;
  ore_effettive?: number;  // Ore lavorate (dipendenti)
  ore_sosta?: number;      // Ore fatturate/sosta
  consegna_contanti_a?: string;
  km_totali?: number;
}

export async function consuntivaServizio({
  id,
  incasso_ricevuto,
  ore_effettive,
  ore_sosta,
  consegna_contanti_a,
  km_totali,
}: ConsuntivaServizioParams) {
  try {
    const { data, error } = await supabase
      .from('servizi')
      .update({
        stato: 'consuntivato',
        incasso_ricevuto,
        ore_effettive,
        ore_sosta,
        consegna_contanti_a,
        km_totali,
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('[consuntivaServizio] Error:', error);
    return { data: null, error };
  }
}
