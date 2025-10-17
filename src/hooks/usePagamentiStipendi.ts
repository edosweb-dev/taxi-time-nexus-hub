import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { 
  fetchPagamentiStipendi, 
  createPagamentoStipendio,
  getPagamentoDetail,
  annullaPagamento,
  type PagamentoStipendio,
  type PagamentoStipendioDetail,
  type FiltriPagamenti,
  type CreatePagamentoInput,
} from '@/lib/api/stipendi/pagamenti';

/**
 * Hook per recuperare lista pagamenti stipendi con filtri opzionali
 */
export function usePagamentiStipendi(filtri?: FiltriPagamenti) {
  return useQuery({
    queryKey: ['pagamenti-stipendi', filtri],
    queryFn: () => fetchPagamentiStipendi(filtri),
    staleTime: 5 * 60 * 1000, // 5 minuti
  });
}

/**
 * Hook per creare un nuovo pagamento stipendio
 */
export function useCreatePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPagamentoStipendio,
    onSuccess: () => {
      // Invalida query pagamenti
      queryClient.invalidateQueries({ queryKey: ['pagamenti-stipendi'] });
      
      // Invalida query spese aziendali (trigger crea spesa automatica)
      queryClient.invalidateQueries({ queryKey: ['spese-aziendali'] });
      
      // Toast success
      toast.success('Pagamento registrato con successo!');
    },
    onError: (error: Error) => {
      console.error('[useCreatePagamento] Error:', error);
      toast.error(error.message || 'Errore durante la registrazione del pagamento');
    },
  });
}

/**
 * Hook per recuperare dettaglio singolo pagamento
 */
export function usePagamentoDetail(id: string) {
  return useQuery({
    queryKey: ['pagamento', id],
    queryFn: () => getPagamentoDetail(id),
    enabled: !!id, // Esegui query solo se id esiste
  });
}

/**
 * Hook per annullare un pagamento esistente
 */
export function useAnnullaPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, motivazione }: { id: string; motivazione: string }) => 
      annullaPagamento(id, motivazione),
    onSuccess: (data) => {
      // Invalida query pagamenti
      queryClient.invalidateQueries({ queryKey: ['pagamenti-stipendi'] });
      
      // Invalida query spese aziendali (spesa collegata viene aggiornata)
      queryClient.invalidateQueries({ queryKey: ['spese-aziendali'] });
      
      // Invalida dettaglio specifico
      queryClient.invalidateQueries({ queryKey: ['pagamento', data.id] });
      
      // Toast success
      toast.success('Pagamento annullato con successo');
    },
    onError: (error: Error) => {
      console.error('[useAnnullaPagamento] Error:', error);
      toast.error(error.message || 'Errore durante l\'annullamento del pagamento');
    },
  });
}

// Re-export types per convenience
export type { 
  PagamentoStipendio, 
  PagamentoStipendioDetail, 
  FiltriPagamenti, 
  CreatePagamentoInput 
};
