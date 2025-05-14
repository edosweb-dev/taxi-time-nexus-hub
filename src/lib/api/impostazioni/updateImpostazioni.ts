
import { supabase } from "@/lib/supabase";
import { Impostazioni, ImpostazioniFormData, MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { Json } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from "uuid";

export async function updateImpostazioni(data: Partial<ImpostazioniFormData>): Promise<Impostazioni | null> {
  try {
    // Ensure we have an ID to update
    if (!data.id) {
      throw new Error("Missing ID for settings update");
    }

    // Ensure we have valid data with required fields
    const ensureMetodiPagamentoIds = (metodi: any[] = []): MetodoPagamentoOption[] => {
      return metodi.map(metodo => ({
        id: metodo.id || uuidv4(),
        nome: metodo.nome || "",
        iva_applicabile: metodo.iva_applicabile === true,
        aliquota_iva: metodo.aliquota_iva || "",
      }));
    };

    const ensureAliquoteIvaIds = (aliquote: any[] = []): AliquotaIvaOption[] => {
      return aliquote.map(aliquota => ({
        id: aliquota.id || uuidv4(),
        nome: aliquota.nome || "",
        percentuale: Number(aliquota.percentuale || 0),
        descrizione: aliquota.descrizione || "",
      }));
    };

    // Process and normalize the data
    const processedMetodi = data.metodi_pagamento ? ensureMetodiPagamentoIds(data.metodi_pagamento) : [];
    const processedAliquote = data.aliquote_iva ? ensureAliquoteIvaIds(data.aliquote_iva) : [];

    // Convert to format suitable for the database
    const dataToUpdate: Record<string, any> = {
      ...data,
      metodi_pagamento: processedMetodi as unknown as Json,
      aliquote_iva: processedAliquote as unknown as Json,
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
    const metodi_raw = updatedData.metodi_pagamento as unknown;
    const metodi = Array.isArray(metodi_raw) 
      ? ensureMetodiPagamentoIds(metodi_raw as any[])
      : [];
    
    const aliquote_raw = updatedData.aliquote_iva as unknown;
    const aliquote = Array.isArray(aliquote_raw) 
      ? ensureAliquoteIvaIds(aliquote_raw as any[])
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
