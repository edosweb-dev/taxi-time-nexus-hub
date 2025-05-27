
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ModalitaPagamento } from '@/lib/types/spese-aziendali';
import { toast } from '@/components/ui/use-toast';

export const useModalitaPagamenti = () => {
  const queryClient = useQueryClient();

  const fetchModalita = useQuery({
    queryKey: ['modalita-pagamenti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modalita_pagamenti')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as ModalitaPagamento[];
    },
  });

  const fetchModalitaAttive = useQuery({
    queryKey: ['modalita-pagamenti-attive'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modalita_pagamenti')
        .select('*')
        .eq('attivo', true)
        .order('nome');

      if (error) throw error;
      return data as ModalitaPagamento[];
    },
  });

  const addModalita = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from('modalita_pagamenti')
        .insert([{ nome }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalita-pagamenti'] });
      queryClient.invalidateQueries({ queryKey: ['modalita-pagamenti-attive'] });
      toast({
        title: "Modalità aggiunta",
        description: "La modalità di pagamento è stata aggiunta con successo.",
      });
    },
  });

  const toggleModalita = useMutation({
    mutationFn: async ({ id, attivo }: { id: string; attivo: boolean }) => {
      const { error } = await supabase
        .from('modalita_pagamenti')
        .update({ attivo })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modalita-pagamenti'] });
      queryClient.invalidateQueries({ queryKey: ['modalita-pagamenti-attive'] });
      toast({
        title: "Modalità aggiornata",
        description: "Lo stato della modalità di pagamento è stato aggiornato.",
      });
    },
  });

  return {
    modalita: fetchModalita.data || [],
    modalitaAttive: fetchModalitaAttive.data || [],
    isLoading: fetchModalita.isLoading,
    addModalita,
    toggleModalita,
  };
};
