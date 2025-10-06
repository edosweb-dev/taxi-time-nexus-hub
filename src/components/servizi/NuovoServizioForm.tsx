
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useServizi } from "@/hooks/useServizi";
import { toast } from "@/components/ui/sonner";
import { useServizioForm } from "@/hooks/useServizioForm";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Step1AziendaPercorso } from "./steps/Step1AziendaPercorso";
import { Step2DettagliOperativi } from "./steps/Step2DettagliOperativi";
import { Step3ComunicazioneNote } from "./steps/Step3ComunicazioneNote";
import { Step4Passeggeri } from "./steps/Step4Passeggeri";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 0, title: "Azienda e Percorso", description: "Dati principali del servizio" },
  { id: 1, title: "Dettagli Operativi", description: "Pagamento e veicolo" },
  { id: 2, title: "Comunicazione", description: "Email e note" },
  { id: 3, title: "Passeggeri", description: "Gestione passeggeri" },
];

export function NuovoServizioForm() {
  const navigate = useNavigate();
  const { form, profile } = useServizioForm();
  const { createServizio, isCreating } = useServizi();
  const [currentStep, setCurrentStep] = useState(0);

  const canGoNext = () => {
    const values = form.getValues();
    console.log('[NuovoServizioForm] canGoNext - currentStep:', currentStep);
    console.log('[NuovoServizioForm] canGoNext - form values:', values);
    
    switch (currentStep) {
      case 0: // Step 1: Azienda e Percorso
        const step0Valid = values.azienda_id && 
               values.data_servizio && 
               values.orario_servizio &&
               values.indirizzo_presa && 
               values.indirizzo_destinazione;
        console.log('[NuovoServizioForm] Step 0 validation:', {
          azienda_id: values.azienda_id,
          data_servizio: values.data_servizio,
          orario_servizio: values.orario_servizio,
          indirizzo_presa: values.indirizzo_presa,
          indirizzo_destinazione: values.indirizzo_destinazione,
          result: step0Valid
        });
        return step0Valid;
      case 1: // Step 2: Dettagli Operativi
        return values.metodo_pagamento;
      case 2: // Step 3: Comunicazione
        return true; // Note opzionale
      case 3: // Step 4: Passeggeri
        return values.passeggeri?.length > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    console.log('[NuovoServizioForm] handleNext - currentStep:', currentStep);
    
    const fieldsToValidate = {
      0: ["azienda_id", "data_servizio", "orario_servizio", "indirizzo_presa", "indirizzo_destinazione"],
      1: ["metodo_pagamento"],
      2: [],
      3: ["passeggeri"],
    }[currentStep] || [];

    console.log('[NuovoServizioForm] Fields to validate:', fieldsToValidate);
    
    const isValid = await form.trigger(fieldsToValidate as any);
    console.log('[NuovoServizioForm] Validation result:', isValid);
    console.log('[NuovoServizioForm] Form errors:', form.formState.errors);
    console.log('[NuovoServizioForm] canGoNext result:', canGoNext());
    
    if (isValid && canGoNext()) {
      console.log('[NuovoServizioForm] Proceeding to next step');
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
      console.log('[NuovoServizioForm] Cannot proceed - validation failed or required fields missing');
      toast.error("Compila tutti i campi obbligatori prima di procedere");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

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
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((step, idx) => (
              <div
                key={step.id}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  idx <= currentStep ? "bg-primary" : "bg-muted",
                  idx === currentStep ? "w-16" : "w-12"
                )}
              />
            ))}
          </div>
          <div className="text-center mt-4">
            <h2 className="text-xl font-bold">{STEPS[currentStep].title}</h2>
            <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Step {currentStep + 1} di {STEPS.length}
            </p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
          {/* Render current step */}
          {currentStep === 0 && <Step1AziendaPercorso />}
          {currentStep === 1 && <Step2DettagliOperativi />}
          {currentStep === 2 && <Step3ComunicazioneNote />}
          {currentStep === 3 && <Step4Passeggeri />}
        </form>
        
        {/* Navigation Buttons - Sticky Bottom */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const hasData = form.formState.isDirty;
                if (hasData) {
                  if (confirm("Ci sono dati non salvati. Sicuro di voler uscire?")) {
                    navigate(-1);
                  }
                } else {
                  navigate(-1);
                }
              }}
              className="w-full sm:w-auto"
            >
              Annulla
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Indietro
                </Button>
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="w-full sm:w-auto"
                >
                  Avanti
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isCreating || !canGoNext()}
                  className="w-full sm:w-auto"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"></div>
                      Creazione...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Crea servizio
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
