
import { supabase } from "@/lib/supabase";
import { Impostazioni, MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { Json } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from "uuid";

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

    // Ensure each item has required ID field
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

    // Parse JSON fields from database
    const metodi_raw = data.metodi_pagamento as unknown;
    const metodi = Array.isArray(metodi_raw) 
      ? ensureMetodiPagamentoIds(metodi_raw as any[])
      : [];
    
    const aliquote_raw = data.aliquote_iva as unknown;
    const aliquote = Array.isArray(aliquote_raw) 
      ? ensureAliquoteIvaIds(aliquote_raw as any[])
      : [];

    // Return properly typed data
    return {
      ...data,
      metodi_pagamento: metodi,
      aliquote_iva: aliquote,
    } as Impostazioni;
  } catch (error) {
    console.error("Unexpected error fetching impostazioni:", error);
    throw error;
  }
}
