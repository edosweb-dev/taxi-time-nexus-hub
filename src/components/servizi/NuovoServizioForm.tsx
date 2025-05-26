
import React from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useServizi } from "@/hooks/useServizi";
import { toast } from "@/components/ui/sonner";
import { ServizioDetailsForm } from "./ServizioDetailsForm";
import { PasseggeroForm } from "./passeggeri/PasseggeroForm";
import { useServizioForm } from "@/hooks/useServizioForm";
import { IndirizziIntermediSummary } from "./IndirizziIntermediSummary";

export function NuovoServizioForm() {
  const navigate = useNavigate();
  const { form, profile } = useServizioForm();
  const { createServizio, isCreating } = useServizi();

  const onSubmit = async (values: any) => {
    try {
      if (!profile) {
        toast.error("Utente non autenticato");
        return;
      }

      // Se è un cliente, assicuriamoci che referente_id sia impostato
      const referente_id = values.referente_id || profile.id;

      await createServizio({
        servizio: {
          azienda_id: values.azienda_id,
          referente_id,
          numero_commessa: values.numero_commessa,
          data_servizio: values.data_servizio,
          orario_servizio: values.orario_servizio,
          indirizzo_presa: values.indirizzo_presa,
          indirizzo_destinazione: values.indirizzo_destinazione,
          metodo_pagamento: values.metodo_pagamento,
          note: values.note,
          veicolo_id: values.veicolo_id,
        },
        passeggeri: values.passeggeri.map((p: any) => ({
          ...p,
          // Se non usa indirizzo personalizzato, i campi personalizzati saranno null
          // Se usa indirizzo personalizzato, assicuriamoci che i campi siano compilati
          orario_presa_personalizzato: p.usa_indirizzo_personalizzato ? p.orario_presa_personalizzato || values.orario_servizio : null,
          luogo_presa_personalizzato: p.usa_indirizzo_personalizzato ? p.luogo_presa_personalizzato || values.indirizzo_presa : null,
          destinazione_personalizzato: p.usa_indirizzo_personalizzato ? p.destinazione_personalizzato || values.indirizzo_destinazione : null
        })),
      });

      navigate("/servizi");
    } catch (error: any) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ServizioDetailsForm />
        <PasseggeroForm />
        
        <IndirizziIntermediSummary />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? "Creazione in corso..." : "Crea servizio"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
