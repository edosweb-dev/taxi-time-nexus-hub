import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Servizio } from "@/lib/types/servizi";

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
  // ✅ OPZIONE C (IVA IBRIDA): Usa sempre IVA storica dal DB
  // L'IVA viene valorizzata alla creazione e non cambia successivamente
  const ivaPercentage = servizio.iva ?? 10;
  
  // ✅ SEMANTICA CORRETTA:
  // - incasso_previsto = NETTO (imponibile)
  // - incasso_ricevuto = LORDO (totale con IVA)
  // Calcola LORDO da NETTO se incasso_ricevuto non esiste
  const calcolaLordoDaNetto = (netto: number, iva: number) => netto * (1 + iva / 100);
  const defaultIncasso = servizio.incasso_ricevuto 
    || (servizio.incasso_previsto ? calcolaLordoDaNetto(servizio.incasso_previsto, ivaPercentage) : undefined);
  
  const form = useForm<ConsuntivaServizioFormData>({
    resolver: zodResolver(consuntivaServizioSchema),
    defaultValues: {
      ore_sosta: servizio.ore_sosta || undefined,
      // ✅ Se incasso_ricevuto esiste usa quello, altrimenti calcola LORDO da incasso_previsto (NETTO)
      incasso_ricevuto: defaultIncasso,
      km_totali: servizio.km_totali || undefined,
    },
  });
  
  // Watch the current form values
  const incassoRicevuto = form.watch("incasso_ricevuto");
  
  // ✅ SCORPORO IVA: incassoRicevuto è il totale lordo, calcoliamo IVA e imponibile
  const ivaAmount = incassoRicevuto 
    ? (incassoRicevuto * ivaPercentage) / (100 + ivaPercentage)
    : 0;
  
  const imponibile = incassoRicevuto ? incassoRicevuto - ivaAmount : 0;
  
  const handleSubmit = (data: ConsuntivaServizioFormData) => {
    // 🔍 DEBUG LOG per tracciare dati form
    console.log('📊 [useConsuntivaServizioForm] Form submit:', {
      metodo_pagamento: servizio.metodo_pagamento,
      incasso_ricevuto_input: data.incasso_ricevuto,
      ivaPercentage,
      servizioIva: servizio.iva,
    });
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
