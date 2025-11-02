
import { supabase } from '@/lib/supabase';

interface ConsuntivaServizioParams {
  id: string;
  incasso_previsto?: number;
  ore_sosta?: number;  // UNICO campo ore
  consegna_contanti_a?: string;
  km_totali?: number;
}

export async function consuntivaServizio({
  id,
  incasso_previsto,
  ore_sosta,
  consegna_contanti_a,
  km_totali,
}: ConsuntivaServizioParams) {
  try {
    const { data, error } = await supabase
      .from('servizi')
      .update({
        stato: 'consuntivato',
        incasso_previsto,
        ore_sosta,  // UNICO campo ore
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
