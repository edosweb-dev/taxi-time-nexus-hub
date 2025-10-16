import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Profile } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getImpostazioni } from "@/lib/api/impostazioni/getImpostazioni";
import { completaServizio } from "@/lib/api/servizi";
import { toast } from "@/components/ui/sonner";
import { Servizio } from "@/lib/types/servizi";

// Form schema
export const completaServizioSchema = z.object({
  metodo_pagamento: z.string({
    required_error: "Seleziona un metodo di pagamento",
  }),
  incasso_ricevuto: z.coerce.number().min(0, "Deve essere un numero positivo"),
});

export type CompletaServizioFormData = z.infer<typeof completaServizioSchema>;

interface UseCompletaServizioFormProps {
  servizioId: string;
  metodoDefault: string;
  onComplete: () => void;
  onOpenChange: (open: boolean) => void;
  users: Profile[];
  open: boolean;
  servizio: Servizio;
}

export function useCompletaServizioForm({
  servizioId,
  metodoDefault,
  onComplete,
  onOpenChange,
  users,
  open,
  servizio
}: UseCompletaServizioFormProps) {
  
  // Load impostazioni for metodi pagamento
  const { data: impostazioni, isLoading: impostazioniLoading } = useQuery({
    queryKey: ['impostazioni'],
    queryFn: getImpostazioni,
    enabled: open,
  });

  const metodiPagamento = impostazioni?.metodi_pagamento || [];

  // Initialize form
  const form = useForm<CompletaServizioFormData>({
    resolver: zodResolver(completaServizioSchema),
    defaultValues: {
      metodo_pagamento: metodoDefault,
      incasso_ricevuto: servizio.incasso_ricevuto || 0,
    },
  });

  // Submit handler
  async function onSubmit(data: CompletaServizioFormData) {
    try {
      // VALIDAZIONE: Check firma cliente se obbligatoria
      if (servizio?.aziende?.firma_digitale_attiva && !servizio?.firma_url) {
        toast.error("Firma cliente mancante", {
          description: "Richiedi prima la firma del cliente prima di completare il servizio."
        });
        return;
      }

      // Procedi con completamento normale
      const result = await completaServizio({
        id: servizioId,
        metodo_pagamento: data.metodo_pagamento,
        incasso_ricevuto: data.incasso_ricevuto,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success("Servizio completato con successo");
      onOpenChange(false);
      onComplete();
    } catch (error: any) {
      toast.error(`Errore: ${error.message || "Si è verificato un errore"}`);
    }
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    metodiPagamento,
    impostazioniLoading,
  };
}
