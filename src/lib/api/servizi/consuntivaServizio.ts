
import { supabase } from '@/lib/supabase';

interface ConsuntivaServizioParams {
  id: string;
  incasso_previsto?: number;
  ore_finali?: number;
  consegna_contanti_a?: string;
}

export async function consuntivaServizio({
  id,
  incasso_previsto,
  ore_finali,
  consegna_contanti_a,
}: ConsuntivaServizioParams) {
  try {
    const { data, error } = await supabase
      .from('servizi')
      .update({
        stato: 'consuntivato',
        incasso_previsto,
        ore_finali,
        consegna_contanti_a,
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
