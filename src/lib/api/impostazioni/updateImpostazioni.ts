
import { supabase } from "@/lib/supabase";
import { Impostazioni, ImpostazioniFormData, MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { Json } from "@/integrations/supabase/types";

export async function updateImpostazioni(data: Partial<ImpostazioniFormData>): Promise<Impostazioni | null> {
  try {
    // Ensure we have an ID to update
    if (!data.id) {
      throw new Error("Missing ID for settings update");
    }

    const dataToUpdate: Record<string, any> = {
      ...data,
      // Convert array objects to JSON compatible format
      metodi_pagamento: data.metodi_pagamento as unknown as Json,
      aliquote_iva: data.aliquote_iva as unknown as Json,
    };

    const { data: updatedData, error } = await supabase
      .from('impostazioni')
      .update(dataToUpdate)
      .eq('id', data.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating impostazioni:", error);
      throw error;
    }

    if (!updatedData) {
      return null;
    }

    // Parse JSON fields from database response
    const metodi = Array.isArray(updatedData.metodi_pagamento) 
      ? updatedData.metodi_pagamento as unknown as MetodoPagamentoOption[]
      : [];
    
    const aliquote = Array.isArray(updatedData.aliquote_iva) 
      ? updatedData.aliquote_iva as unknown as AliquotaIvaOption[]
      : [];

    // Return properly typed data
    return {
      ...updatedData,
      metodi_pagamento: metodi,
      aliquote_iva: aliquote,
    } as Impostazioni;
  } catch (error) {
    console.error("Unexpected error updating impostazioni:", error);
    throw error;
  }
}
