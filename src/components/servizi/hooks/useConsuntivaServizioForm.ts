
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Servizio } from "@/lib/types/servizi";
import { getIvaPercentageForServizio } from "../utils/ivaCalculation";

// SEMPLIFICAZIONE: Solo ore_sosta
export const consuntivaServizioSchema = z.object({
  incasso_ricevuto: z
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
  // ✅ Default 10% come da specifiche
  const ivaServizio = servizio.iva || (servizio as any).azienda?.iva || 10;
  const [ivaPercentage, setIvaPercentage] = useState<number>(ivaServizio);
  
  const form = useForm<ConsuntivaServizioFormData>({
    resolver: zodResolver(consuntivaServizioSchema),
    defaultValues: {
      ore_sosta: servizio.ore_sosta || undefined,
      // ✅ Usa incasso_ricevuto se già presente, altrimenti usa incasso_previsto come suggerimento
      incasso_ricevuto: servizio.incasso_ricevuto || servizio.incasso_previsto,
      km_totali: servizio.km_totali || undefined,
    },
  });
  
  // Watch the current form values
  const incassoRicevuto = form.watch("incasso_ricevuto");
  
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
  
  // ✅ SCORPORO IVA: incassoRicevuto è il totale lordo, calcoliamo IVA e imponibile
  const ivaAmount = incassoRicevuto 
    ? (incassoRicevuto * ivaPercentage) / (100 + ivaPercentage)
    : 0;
  
  const imponibile = incassoRicevuto ? incassoRicevuto - ivaAmount : 0;
  
  const handleSubmit = (data: ConsuntivaServizioFormData) => {
    onSubmit(data);
  };
  
  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    ivaPercentage,
    ivaAmount,
    imponibile,
    totaleRicevuto: incassoRicevuto, // ✅ Totale = incasso ricevuto (nessun ricalcolo!)
    isSubmitting: form.formState.isSubmitting,
  };
}
