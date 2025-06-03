
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStipendi, getStipendioById, getTariffeKm, getConfigurazioneStipendi } from '@/lib/api/stipendi';
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
