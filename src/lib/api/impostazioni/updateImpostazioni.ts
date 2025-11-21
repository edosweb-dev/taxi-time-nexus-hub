import { supabase } from "@/lib/supabase";
import { Impostazioni, ImpostazioniFormData, MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { Json } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Security: Input validation schemas to prevent injection and data corruption
const metodoPagamentoSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  nome: z.string().min(1, "Nome is required").max(100, "Nome must be less than 100 characters"),
  iva_applicabile: z.boolean(),
  aliquota_iva: z.string().max(50, "Aliquota IVA must be less than 50 characters").optional(),
  report_attivo: z.boolean(),
});

const aliquotaIvaSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID"),
  nome: z.string().min(1, "Nome is required").max(100, "Nome must be less than 100 characters"),
  percentuale: z.number()
    .min(0, "Percentage cannot be negative")
    .max(100, "Percentage cannot exceed 100"),
  descrizione: z.string().max(500, "Descrizione must be less than 500 characters").optional(),
  is_default: z.boolean().optional(),
});

const impostazioniUpdateSchema = z.object({
  id: z.string().uuid("ID must be a valid UUID").optional(),
  nome_azienda: z.string().min(1).max(200).optional(),
  partita_iva: z.string().max(50).optional(),
  indirizzo_sede: z.string().max(500).optional(),
  telefono: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  metodi_pagamento: z.array(metodoPagamentoSchema).max(50, "Cannot have more than 50 payment methods"),
  aliquote_iva: z.array(aliquotaIvaSchema).max(20, "Cannot have more than 20 VAT rates"),
});

export async function updateImpostazioni(data: Partial<ImpostazioniFormData>): Promise<Impostazioni | null> {
  try {
    // Ensure we have an ID to update
    if (!data.id) {
      throw new Error("Missing ID for settings update");
    }

    // Security: Validate all input data before processing
    const validationResult = impostazioniUpdateSchema.safeParse(data);
    if (!validationResult.success) {
      console.error("Input validation failed:", validationResult.error.format());
      throw new Error(`Invalid input data: ${validationResult.error.errors.map(e => e.message).join(", ")}`);
    }

    const validatedData = validationResult.data;

    // Ensure we have valid data with required fields
    const ensureMetodiPagamentoIds = (metodi: any[] = []): MetodoPagamentoOption[] => {
      return metodi.map(metodo => ({
        id: metodo.id || uuidv4(),
        nome: metodo.nome || "",
        iva_applicabile: metodo.iva_applicabile === true,
        aliquota_iva: metodo.aliquota_iva || "",
        report_attivo: metodo.report_attivo === true,
      }));
    };

    const ensureAliquoteIvaIds = (aliquote: any[] = []): AliquotaIvaOption[] => {
      return aliquote.map(aliquota => ({
        id: aliquota.id || uuidv4(),
        nome: aliquota.nome || "",
        percentuale: Number(aliquota.percentuale || 0),
        descrizione: aliquota.descrizione || "",
        is_default: aliquota.is_default === true,
      }));
    };

    // Process and normalize the data (already validated)
    const processedMetodi = validatedData.metodi_pagamento ? ensureMetodiPagamentoIds(validatedData.metodi_pagamento) : [];
    const processedAliquote = validatedData.aliquote_iva ? ensureAliquoteIvaIds(validatedData.aliquote_iva) : [];

    // Convert to format suitable for the database
    const dataToUpdate: Record<string, any> = {
      ...validatedData,
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
