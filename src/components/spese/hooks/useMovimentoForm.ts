
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useUsers } from "@/hooks/useUsers";
import { getMetodiPagamento } from "@/lib/api/spese";
import { createMovimento } from "@/lib/api/spese";
import { MovimentoTipo, MovimentoAziendaleFormData, MetodoPagamentoSpesa } from "@/lib/types/spese";
import { movimentoFormSchema, MovimentoFormValues, defaultMovimentoValues } from "../schemas/movimentoFormSchema";

export function useMovimentoForm(onMovimentoCreated?: () => void) {
  const [metodiPagamento, setMetodiPagamento] = useState<MetodoPagamentoSpesa[]>([]);
  const [isLoadingMetodi, setIsLoadingMetodi] = useState(false);
  const { users, isLoading: isLoadingUsers } = useUsers();

  // Solo soci per il campo "effettuato da"
  const soci = users.filter((user) => user.role === "socio");

  const form = useForm<MovimentoFormValues>({
    resolver: zodResolver(movimentoFormSchema),
    defaultValues: defaultMovimentoValues,
  });

  useEffect(() => {
    loadMetodiPagamento();
  }, []);

  const loadMetodiPagamento = async () => {
    setIsLoadingMetodi(true);
    try {
      const metodi = await getMetodiPagamento();
      setMetodiPagamento(metodi);
      if (metodi.length > 0) {
        form.setValue("metodo_pagamento_id", metodi[0].id);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei metodi di pagamento:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i metodi di pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMetodi(false);
    }
  };

  const onSubmit = async (data: MovimentoFormValues) => {
    try {
      // Se non è effettuato da un socio, rimuovi il campo effettuato_da_id
      const { è_effettuato_da_socio, ...movimentoData } = data;
      
      if (!è_effettuato_da_socio) {
        movimentoData.effettuato_da_id = undefined;
      }

      // Ensure causale is never empty (required by MovimentoAziendaleFormData)
      if (!movimentoData.causale || movimentoData.causale.trim() === '') {
        toast({
          title: "Errore",
          description: "Il campo causale è obbligatorio.",
          variant: "destructive",
        });
        return;
      }

      const formattedData: MovimentoAziendaleFormData = {
        ...movimentoData,
        data: format(data.data, "yyyy-MM-dd"),
        importo: Number(data.importo),
        causale: movimentoData.causale.trim(),
        tipo: movimentoData.tipo as MovimentoTipo, // Ensure tipo is properly typed
      };

      await createMovimento(formattedData);

      toast({
        title: "Movimento registrato",
        description: "Il movimento è stato registrato con successo.",
      });

      form.reset({
        ...defaultMovimentoValues,
        metodo_pagamento_id: metodiPagamento.length > 0 ? metodiPagamento[0].id : "",
      });

      if (onMovimentoCreated) {
        onMovimentoCreated();
      }
    } catch (error) {
      console.error("Errore durante la registrazione del movimento:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la registrazione del movimento.",
        variant: "destructive",
      });
    }
  };

  return {
    form,
    metodiPagamento,
    isLoadingMetodi,
    soci,
    isLoadingUsers,
    onSubmit
  };
}
