
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SpesaAziendale, MovimentoFormData, TotaliMese } from '@/lib/types/spese-aziendali';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSpeseAziendali = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchMovimenti = useQuery({
    queryKey: ['spese-aziendali'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spese_aziendali')
        .select(`
          *,
          modalita_pagamento:modalita_pagamenti(nome),
          socio:profiles(id, first_name, last_name)
        `)
        .order('data_movimento', { ascending: false });

      if (error) throw error;
      return data as SpesaAziendale[];
    },
  });

  const addMovimento = useMutation({
    mutationFn: async (data: MovimentoFormData) => {
      const { data: result, error } = await supabase
        .from('spese_aziendali')
        .insert([{
          ...data,
          created_by: user?.id || ''
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spese-aziendali'] });
      queryClient.invalidateQueries({ queryKey: ['pending-count'] });
      queryClient.invalidateQueries({ queryKey: ['totali-mese'] });
      toast({
        title: "Movimento registrato",
        description: "Il movimento è stato registrato con successo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore durante la registrazione del movimento.",
        variant: "destructive",
      });
    },
  });

  const updateStatoPagamento = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: 'completato' | 'pending' }) => {
      const { error } = await supabase
        .from('spese_aziendali')
        .update({ stato_pagamento: stato })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spese-aziendali'] });
      queryClient.invalidateQueries({ queryKey: ['pending-count'] });
      toast({
        title: "Stato aggiornato",
        description: "Lo stato del pagamento è stato aggiornato.",
      });
    },
  });

  const getPendingCount = useQuery({
    queryKey: ['pending-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('spese_aziendali')
        .select('*', { count: 'exact', head: true })
        .eq('stato_pagamento', 'pending');

      if (error) throw error;
      return count || 0;
    },
  });

  const getTotaliMese = useQuery({
    queryKey: ['totali-mese', new Date().getMonth(), new Date().getFullYear()],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('spese_aziendali')
        .select('tipologia, importo')
        .gte('data_movimento', startOfMonth.toISOString().split('T')[0])
        .lte('data_movimento', endOfMonth.toISOString().split('T')[0])
        .eq('stato_pagamento', 'completato');

      if (error) throw error;

      const totali = data.reduce(
        (acc, movimento) => {
          switch (movimento.tipologia) {
            case 'spesa':
              acc.spese += Number(movimento.importo);
              break;
            case 'incasso':
              acc.incassi += Number(movimento.importo);
              break;
            case 'prelievo':
              acc.prelievi += Number(movimento.importo);
              break;
          }
          return acc;
        },
        { spese: 0, incassi: 0, prelievi: 0, saldo: 0 }
      );

      totali.saldo = totali.incassi - totali.spese - totali.prelievi;
      return totali as TotaliMese;
    },
  });

  return {
    movimenti: fetchMovimenti.data || [],
    isLoading: fetchMovimenti.isLoading,
    error: fetchMovimenti.error,
    addMovimento,
    updateStatoPagamento,
    pendingCount: getPendingCount.data || 0,
    totaliMese: getTotaliMese.data,
  };
};
