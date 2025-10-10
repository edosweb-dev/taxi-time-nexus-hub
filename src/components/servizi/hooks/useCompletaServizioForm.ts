import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Profile } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getImpostazioni } from "@/lib/api/impostazioni/getImpostazioni";
import { completaServizio } from "@/lib/api/servizi";
import { toast } from "@/components/ui/sonner";
import { useFirmaDigitale } from "@/hooks/useFirmaDigitale";

// Form schema
export const completaServizioSchema = z.object({
  metodo_pagamento: z.string({
    required_error: "Seleziona un metodo di pagamento",
  }),
  incasso_ricevuto: z.coerce.number().min(0, "Deve essere un numero positivo").optional(),
  ore_lavorate: z.coerce.number().min(0, "Deve essere un numero positivo").optional(),
  consegna_contanti_a: z.string().optional(),
});

export type CompletaServizioFormData = z.infer<typeof completaServizioSchema>;

interface UseCompletaServizioFormProps {
  servizioId: string;
  metodoDefault: string;
  onComplete: () => void;
  onOpenChange: (open: boolean) => void;
  users: Profile[];
  open: boolean;
}

export function useCompletaServizioForm({
  servizioId,
  metodoDefault,
  onComplete,
  onOpenChange,
  users,
  open
}: UseCompletaServizioFormProps) {
  const [adminUsers, setAdminUsers] = useState<{ id: string; name: string }[]>([]);
  const [isContanti, setIsContanti] = useState(metodoDefault === 'Contanti');
  
  // Check firma digitale
  const { isFirmaDigitaleAttiva, isLoading: firmaLoading } = useFirmaDigitale();
  
  // State per gestire flusso firma
  const [showFirmaDialog, setShowFirmaDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CompletaServizioFormData | null>(null);
  
  // Load impostazioni for metodi pagamento
  const { data: impostazioni, isLoading: impostazioniLoading } = useQuery({
    queryKey: ['impostazioni'],
    queryFn: getImpostazioni,
    enabled: open,
  });

  const metodiPagamento = impostazioni?.metodi_pagamento || [];

  // Filter admin users
  useEffect(() => {
    if (users) {
      const filteredUsers = users
        .filter(user => user.role === 'admin' || user.role === 'socio')
        .map(user => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.id,
        }));
      setAdminUsers(filteredUsers);
    }
  }, [users]);

  // Initialize form
  const form = useForm<CompletaServizioFormData>({
    resolver: zodResolver(completaServizioSchema),
    defaultValues: {
      metodo_pagamento: metodoDefault,
      incasso_ricevuto: 0,
      ore_lavorate: 0,
      consegna_contanti_a: '',
    },
  });

  // Update the isContanti state when the metodo_pagamento value changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "metodo_pagamento") {
        setIsContanti(value.metodo_pagamento === "Contanti");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Submit handler
  async function onSubmit(data: CompletaServizioFormData) {
    // Se firma obbligatoria, apri dialog firma
    if (isFirmaDigitaleAttiva) {
      setPendingFormData(data);
      setShowFirmaDialog(true);
      return; // Non completare ancora
    }
    
    // Se firma NON obbligatoria, completa direttamente
    await completaServizioSenzaFirma(data);
  }
  
  // Funzione completamento senza firma
  async function completaServizioSenzaFirma(data: CompletaServizioFormData) {
    try {
      const result = await completaServizio({
        id: servizioId,
        metodo_pagamento: data.metodo_pagamento,
        incasso_ricevuto: data.incasso_ricevuto,
        ore_lavorate: data.ore_lavorate,
        consegna_contanti_a: isContanti ? data.consegna_contanti_a : undefined,
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
  
  // Callback dopo firma salvata
  async function onFirmaSalvata() {
    if (!pendingFormData) return;
    
    // Firma salvata → ora completa servizio
    await completaServizioSenzaFirma(pendingFormData);
    setShowFirmaDialog(false);
    setPendingFormData(null);
  }
  
  // Callback chiusura dialog firma
  function onFirmaDialogClose() {
    setShowFirmaDialog(false);
    setPendingFormData(null);
  }

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    isContanti,
    adminUsers,
    metodiPagamento,
    impostazioniLoading,
    // Nuovi return per firma
    isFirmaDigitaleAttiva,
    firmaLoading,
    showFirmaDialog,
    servizioId,
    onFirmaSalvata,
    onFirmaDialogClose,
  };
}
