
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStipendi, getStipendioById, getTariffeKm, getConfigurazioneStipendi } from '@/lib/api/stipendi';
import { createStipendio, CreateStipendioParams } from '@/lib/api/stipendi/createStipendio';
import { toast } from '@/components/ui/sonner';
import type { Stipendio, TariffaKm, ConfigurazioneStipendi } from '@/lib/api/stipendi';

export function useStipendi(filters?: {
  anno?: number;
  mese?: number;
  user_id?: string;
  tipo_calcolo?: string;
}) {
  const queryClient = useQueryClient();

  const {
    data: stipendi = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['stipendi', filters],
    queryFn: () => getStipendi(filters),
  });

  return {
    stipendi,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useStipendioDetail(id: string) {
  return useQuery({
    queryKey: ['stipendio', id],
    queryFn: () => getStipendioById(id),
    enabled: !!id
  });
}

export function useTariffeKm(anno?: number) {
  return useQuery({
    queryKey: ['tariffe-km', anno],
    queryFn: () => getTariffeKm(anno),
  });
}

export function useConfigurazioneStipendi(anno: number) {
  return useQuery({
    queryKey: ['configurazione-stipendi', anno],
    queryFn: () => getConfigurazioneStipendi(anno),
    enabled: !!anno
  });
}

// Mutation for creating stipendio
export function useCreateStipendio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStipendio,
    onSuccess: (newStipendio) => {
      // Invalida le query degli stipendi per ricaricare la lista
      queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      
      // Mostra toast di successo
      toast.success('Stipendio salvato come bozza');
      
      console.log('[useCreateStipendio] Stipendio created successfully:', newStipendio.id);
    },
    onError: (error: Error) => {
      console.error('[useCreateStipendio] Error creating stipendio:', error);
      
      // Gestisci errori specifici
      if (error.message === 'DUPLICATE_STIPENDIO') {
        toast.error('Stipendio già presente per questo mese');
      } else if (error.message === 'PERMISSION_DENIED') {
        toast.error('Non hai i permessi per questa operazione');
      } else {
        toast.error('Errore durante il salvataggio dello stipendio');
      }
    },
  });
}
