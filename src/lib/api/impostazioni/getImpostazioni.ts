
import { supabase } from "@/lib/supabase";
import { Impostazioni } from "@/lib/types/impostazioni";
import { Json } from "@/integrations/supabase/types";

export async function getImpostazioni(): Promise<Impostazioni | null> {
  try {
    const { data, error } = await supabase
      .from('impostazioni')
      .select('*')
      .order('created_at')
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching impostazioni:", error);
      throw error;
    }

    if (!data) {
      return null;
    }

    // Parse JSON fields from database
    return {
      ...data,
      metodi_pagamento: Array.isArray(data.metodi_pagamento) 
        ? data.metodi_pagamento as unknown as MetodoPagamentoOption[] 
        : [],
      aliquote_iva: Array.isArray(data.aliquote_iva) 
        ? data.aliquote_iva as unknown as AliquotaIvaOption[] 
        : [],
    } as Impostazioni;
  } catch (error) {
    console.error("Unexpected error fetching impostazioni:", error);
    throw error;
  }
}

// Add type import
import { MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
