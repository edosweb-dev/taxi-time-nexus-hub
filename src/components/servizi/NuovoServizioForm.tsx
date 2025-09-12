
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
      // Se non c'è referente_id, il passeggero sarà collegato solo all'azienda
      const referente_id = values.referente_id || (profile.role === 'cliente' ? profile.id : null);

      await createServizio({
        servizio: {
          azienda_id: values.azienda_id,
          referente_id,
          numero_commessa: values.numero_commessa,
          data_servizio: values.data_servizio,
          orario_servizio: values.orario_servizio,
          indirizzo_presa: values.indirizzo_presa,
          indirizzo_destinazione: values.indirizzo_destinazione,
          citta_presa: values.citta_presa,
          citta_destinazione: values.citta_destinazione,
          metodo_pagamento: values.metodo_pagamento,
          note: values.note,
          veicolo_id: values.veicolo_id,
          ore_effettive: values.ore_effettive,
          ore_fatturate: values.ore_fatturate,
          applica_provvigione: values.applica_provvigione,
        },
        email_notifiche: values.email_notifiche || [],
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
      <div className="relative min-h-full">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
          {/* Step 1: Service Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                1
              </div>
              <h2 className="text-xl font-semibold">Dettagli del servizio</h2>
            </div>
            <ServizioDetailsForm />
          </div>

          {/* Step 2: Passengers */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                2
              </div>
              <h2 className="text-xl font-semibold">Gestione passeggeri</h2>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <PasseggeroForm userRole={profile?.role} />
            </div>
          </div>

          {/* Step 3: Summary */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                3
              </div>
              <h2 className="text-xl font-semibold">Riepilogo</h2>
            </div>
            <div className="bg-muted/30 border rounded-lg p-6">
              <IndirizziIntermediSummary />
            </div>
          </div>
        </form>
        
        {/* Action Buttons - Sticky Bottom */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 mt-6">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
              className="min-w-[140px]"
              onClick={form.handleSubmit(onSubmit)}
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"></div>
                  Creazione...
                </div>
              ) : (
                "Crea servizio"
              )}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
