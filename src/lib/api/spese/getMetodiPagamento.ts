
import { supabase } from "@/lib/supabase";
import { MetodoPagamentoSpesa } from "@/lib/types/spese";

export const getMetodiPagamento = async (): Promise<MetodoPagamentoSpesa[]> => {
  try {
    const { data, error } = await supabase
      .from('metodi_pagamento_spese')
      .select('*')
      .order('nome');

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching metodi pagamento:', error);
    throw error;
  }
};
