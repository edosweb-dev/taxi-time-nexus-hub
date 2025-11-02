
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
  const [ivaPercentage, setIvaPercentage] = useState<number>(22); // Default value
  const [totalePrevisto, setTotalePrevisto] = useState<number | undefined>(undefined);
  
  // Calcola totale previsto (incasso netto + IVA) per pre-fill
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
  
  const form = useForm<ConsuntivaServizioFormData>({
    resolver: zodResolver(consuntivaServizioSchema),
    defaultValues: {
      ore_sosta: servizio.ore_sosta || undefined,
      // Pre-popola con totale previsto se disponibile
      incasso_previsto: servizio.incasso_previsto || undefined,
      km_totali: servizio.km_totali || undefined,
    },
  });
  
  // Watch the current form values
  const incassoPrevisto = form.watch("incasso_previsto");
  
  // Load the IVA percentage from the settings and calculate total previsto
  useEffect(() => {
    async function loadIvaRate() {
      try {
        const percentage = await getIvaPercentageForServizio(servizio);
        setIvaPercentage(percentage);
        
        // Calcola e imposta totale previsto per pre-fill
        const totale = calcolaTotalePrevisto(servizio.incasso_previsto, percentage);
        setTotalePrevisto(totale);
        
        // Pre-popola il campo con totale previsto se non c'è già un valore
        if (totale !== undefined && !form.getValues('incasso_previsto')) {
          form.setValue('incasso_previsto', totale);
        }
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
