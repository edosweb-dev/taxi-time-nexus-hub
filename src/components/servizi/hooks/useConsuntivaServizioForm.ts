
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Servizio } from "@/lib/types/servizi";
import { getIvaPercentageForServizio } from "../utils/ivaCalculation";

// SEMPLIFICAZIONE: Solo ore_sosta
export const consuntivaServizioSchema = z.object({
  incasso_previsto: z
    .number()
    .min(0, { message: "L'incasso deve essere maggiore di 0" })
    .optional(),
  ore_sosta: z
    .number()
    .min(0, { message: "Le ore devono essere maggiori di 0" })
    .optional(),
  consegna_contanti_a: z.string().optional(),
  km_totali: z.number().min(0).optional(),
});

export type ConsuntivaServizioFormData = z.infer<typeof consuntivaServizioSchema>;

export function useConsuntivaServizioForm(servizio: Servizio, onSubmit: (data: ConsuntivaServizioFormData) => void) {
  // Calcola IVA sincrona usando dati del servizio
  const ivaServizio = servizio.iva || (servizio as any).azienda?.iva || 22;
  const [ivaPercentage, setIvaPercentage] = useState<number>(ivaServizio);
  
  // Calcola totale previsto (incasso netto + IVA) SINCRONO per pre-fill
  const calcolaTotalePrevisto = (incassoNetto: number | undefined, iva: number) => {
    if (!incassoNetto) return undefined;
    
    const importoIva = incassoNetto * (iva / 100);
    const totale = incassoNetto + importoIva;
    
    console.log('📊 Calcolo totale previsto:', {
      netto: incassoNetto,
      iva: `${iva}%`,
      importoIva,
      totale,
    });
    
    return totale;
  };
  
  const totalePrevisto = calcolaTotalePrevisto(servizio.incasso_previsto, ivaServizio);
  
  const form = useForm<ConsuntivaServizioFormData>({
    resolver: zodResolver(consuntivaServizioSchema),
    defaultValues: {
      ore_sosta: servizio.ore_sosta || undefined,
      // Pre-popola con totale previsto (netto + IVA)
      incasso_previsto: totalePrevisto,
      km_totali: servizio.km_totali || undefined,
    },
  });
  
  // Watch the current form values
  const incassoPrevisto = form.watch("incasso_previsto");
  
  // Load the IVA percentage from the settings (async override)
  useEffect(() => {
    async function loadIvaRate() {
      try {
        const percentage = await getIvaPercentageForServizio(servizio);
        setIvaPercentage(percentage);
      } catch (error) {
        console.error("Error loading IVA rate:", error);
      }
    }
    
    loadIvaRate();
  }, [servizio]);
  
  // Calculate the IVA amount
  const ivaAmount = incassoPrevisto ? (incassoPrevisto * ivaPercentage) / 100 : 0;
  
  const handleSubmit = (data: ConsuntivaServizioFormData) => {
    onSubmit(data);
  };
  
  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    ivaPercentage,
    ivaAmount,
    totalePrevisto,
    isSubmitting: form.formState.isSubmitting,
  };
}
