
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Servizio } from "@/lib/types/servizi";
import { getIvaPercentageForServizio } from "../utils/ivaCalculation";

export const consuntivaServizioSchema = z.object({
  ore_finali: z
    .number()
    .min(0, { message: "Le ore devono essere maggiori di 0" })
    .optional(),
  incasso_previsto: z
    .number()
    .min(0, { message: "L'incasso deve essere maggiore di 0" })
    .optional(),
  consegna_contanti_a: z.string().optional(),
  ore_sosta: z.number().min(0).optional(),
  ore_sosta_fatturate: z.number().min(0).optional(),
  km_totali: z.number().min(0).optional(),
});

export type ConsuntivaServizioFormData = z.infer<typeof consuntivaServizioSchema>;

export function useConsuntivaServizioForm(servizio: Servizio, onSubmit: (data: ConsuntivaServizioFormData) => void) {
  const [ivaPercentage, setIvaPercentage] = useState<number>(22); // Default value
  
  const form = useForm<ConsuntivaServizioFormData>({
    resolver: zodResolver(consuntivaServizioSchema),
    defaultValues: {
      ore_finali: servizio.ore_finali || undefined,
      incasso_previsto: servizio.incasso_previsto || undefined,
    },
  });
  
  // Watch the current form values
  const incassoPrevisto = form.watch("incasso_previsto");
  
  // Load the IVA percentage from the settings
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
    isSubmitting: form.formState.isSubmitting,
  };
}
