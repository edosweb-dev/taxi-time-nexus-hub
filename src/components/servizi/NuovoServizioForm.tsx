
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useServizi } from "@/hooks/useServizi";
import { toast } from "@/components/ui/sonner";
import { useServizioForm } from "@/hooks/useServizioForm";
import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { CancelConfirmDialog } from "./CancelConfirmDialog";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  const keyboardVisible = useKeyboardVisible();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const canGoNext = () => {
    const values = form.getValues();
    
    switch (currentStep) {
      case 0: // Step 1: Azienda e Percorso
        const step0Valid = values.azienda_id && 
               values.data_servizio && 
               values.orario_servizio &&
               values.indirizzo_presa && 
               values.indirizzo_destinazione;
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
    const fieldsToValidate = {
      0: ["azienda_id", "data_servizio", "orario_servizio", "indirizzo_presa", "indirizzo_destinazione"],
      1: ["metodo_pagamento"],
      2: [],
      3: ["passeggeri"],
    }[currentStep] || [];
    
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid && canGoNext()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } else {
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
      <div className="w-full min-h-screen">
        {/* Container con padding minimo - massimizza larghezza */}
        <div className="w-full px-4 sm:px-6 md:px-6 lg:px-8 xl:px-8 py-6">
          
          {/* Header Ultra-Compatto */}
          <div className={cn(
            "pb-2 mb-4 border-b flex items-center justify-between",
            "sticky top-0 bg-background/95 backdrop-blur-sm z-10 md:static md:bg-transparent"
          )}>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-medium text-muted-foreground">
                {STEPS[currentStep].title}
              </h1>
              <span className="text-xs text-muted-foreground">
                (Step {currentStep + 1}/{STEPS.length})
              </span>
            </div>
            
            {/* Progress inline compatto */}
            <div className="flex gap-1">
              {STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-all",
                    idx === currentStep && "bg-primary w-8",
                    idx < currentStep && "bg-primary",
                    idx > currentStep && "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Content Area - ZERO restriction */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mb-8">
            {currentStep === 0 && <Step1AziendaPercorso />}
            {currentStep === 1 && <Step2DettagliOperativi />}
            {currentStep === 2 && <Step3ComunicazioneNote />}
            {currentStep === 3 && <Step4Passeggeri />}
          </form>

          {/* Footer Navigation - Bottoni GRANDI e VISIBILI */}
          <div className={cn(
            "border-t pt-6 mt-8 bg-background",
            "sticky bottom-0 bg-background/95 backdrop-blur-sm z-20 -mx-6 px-6 pb-4 md:static md:bg-transparent md:mx-0 md:px-0 md:pb-0",
            "transition-transform duration-200",
            keyboardVisible && "translate-y-full"
          )}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              
              {/* Bottone Annulla */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const hasData = form.formState.isDirty;
                  if (hasData) {
                    setShowCancelDialog(true);
                  } else {
                    navigate(-1);
                  }
                }}
                size="lg"
                className="h-12 px-8 text-base font-medium border-2 hover:bg-accent"
              >
                Annulla
              </Button>

              {/* Gruppo Bottoni Navigation */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    size="lg"
                    className="h-12 px-8 text-base font-medium border-2 hover:bg-accent"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Indietro
                  </Button>
                )}
                
                {currentStep < STEPS.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canGoNext()}
                    size="lg"
                    className="h-12 px-8 text-base font-medium min-w-[160px]"
                  >
                    Avanti
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isCreating || !canGoNext()}
                    size="lg"
                    className="h-12 px-8 text-base font-medium min-w-[180px]"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Salvataggio...
                      </>
                    ) : (
                      <>
                        Salva Servizio
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Cancel Confirmation Dialog */}
        <CancelConfirmDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={() => {
            setShowCancelDialog(false);
            navigate(-1);
          }}
        />
      </div>
    </FormProvider>
  );
}
