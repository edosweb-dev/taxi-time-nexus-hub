import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { MobileButton } from "@/components/ui/mobile-button";
import { Label } from "@/components/ui/label";
import { MobileTextarea } from "@/components/ui/mobile-input";
import { AziendaSelectField } from "./AziendaSelectField";
import { ReferenteSelectField } from "./ReferenteSelectField";
import { useNavigate } from "react-router-dom";
import { useServizi } from "@/hooks/useServizi";
import { toast } from "sonner";
import { useWatch } from "react-hook-form";
import { useEffect, useRef } from "react";

const servizioVeloceSchema = z.object({
  azienda_id: z.string().min(1, "Azienda obbligatoria"),
  referente_id: z.string().optional(),
  note: z.string().optional(),
});

type ServizioVeloceFormData = z.infer<typeof servizioVeloceSchema>;

export const ServizioVeloceForm = () => {
  const navigate = useNavigate();
  const { createServizio, isCreating } = useServizi();
  const wasCreatingRef = useRef(false);
  
  const form = useForm<ServizioVeloceFormData>({
    resolver: zodResolver(servizioVeloceSchema),
    defaultValues: {
      azienda_id: "",
      referente_id: "",
      note: "",
    },
  });

  const aziendaId = useWatch({ control: form.control, name: "azienda_id" });

  // Redirect to servizi list after successful save
  useEffect(() => {
    if (wasCreatingRef.current && !isCreating) {
      // Creation completed (isCreating changed from true to false)
      navigate('/servizi?tab=bozze');
    }
    wasCreatingRef.current = isCreating;
  }, [isCreating, navigate]);

  const onSubmit = (data: ServizioVeloceFormData) => {
    createServizio({
      servizio: {
        azienda_id: data.azienda_id,
        referente_id: data.referente_id || "",
        note: data.note,
        // Campi obbligatori DB con placeholder
        data_servizio: new Date().toISOString().split('T')[0],
        orario_servizio: "00:00",
        indirizzo_presa: "Da definire",
        indirizzo_destinazione: "Da definire",
        metodo_pagamento: "da_definire",
        stato: "bozza",
      },
      passeggeri: [],
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-4 px-4">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold mb-0">Inserimento Veloce</h1>
      </header>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="p-4 space-y-4">
            <AziendaSelectField />
            <ReferenteSelectField aziendaId={aziendaId} />
            
            <div className="space-y-1">
              <Label className="text-sm">Note</Label>
              <MobileTextarea
                placeholder="Note rapide..."
                rows={3}
                className="resize-none"
                {...form.register("note")}
              />
            </div>
          </Card>

          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 mt-4 -mx-4">
            <div className="flex flex-col items-center gap-3 w-full">
              <MobileButton
                type="submit"
                disabled={isCreating}
                touchOptimized={true}
                className="w-[80%] min-h-[44px]"
              >
                {isCreating ? "Salvataggio..." : "Salva bozza"}
              </MobileButton>
              
              <MobileButton
                type="button"
                variant="outline"
                onClick={() => navigate("/servizi")}
                touchOptimized={true}
                className="w-[80%] min-h-[44px]"
              >
                Annulla
              </MobileButton>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
