import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchTariffeKm, 
  updateTariffa, 
  fetchConfigurazioneStipendi,
  updateConfigurazioneStipendi,
  generateFromPreviousYear,
  uploadTariffeCsv,
  simulaCalcoloStipendio
} from '@/lib/api/stipendi/configurazione';
import { TariffaKmFissa, ConfigurazioneStipendi, SimulatoreResult } from '@/lib/types/stipendi';
import { toast } from '@/hooks/use-toast';

export function useTariffeKm(anno: number) {
  return useQuery({
    queryKey: ['tariffe-km', anno],
    queryFn: () => fetchTariffeKm(anno),
    enabled: !!anno
  });
}

export function useUpdateTariffa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, importo }: { id: string; importo: number }) => 
      updateTariffa(id, importo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffe-km'] });
      toast({
        title: 'Tariffa aggiornata',
        description: 'La tariffa è stata modificata con successo'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useConfigurazioneStipendi(anno: number) {
  return useQuery({
    queryKey: ['configurazione-stipendi', anno],
    queryFn: () => fetchConfigurazioneStipendi(anno),
    enabled: !!anno
  });
}

export function useUpdateConfigStipendi() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ anno, config }: { anno: number; config: Partial<ConfigurazioneStipendi> }) =>
      updateConfigurazioneStipendi(anno, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configurazione-stipendi'] });
      toast({
        title: 'Configurazione aggiornata',
        description: 'I parametri sono stati salvati con successo'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useGenerateFromPreviousYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (anno: number) => generateFromPreviousYear(anno),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffe-km'] });
      queryClient.invalidateQueries({ queryKey: ['configurazione-stipendi'] });
      toast({
        title: 'Tariffe copiate',
        description: 'Le tariffe dell\'anno precedente sono state copiate con successo'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useUploadTariffeCsv() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, anno }: { file: File; anno: number }) => 
      uploadTariffeCsv(file, anno),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffe-km'] });
      toast({
        title: 'File caricato',
        description: 'Le tariffe sono state importate con successo'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore caricamento',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

export function useSimulatoreCalcolo() {
  return useMutation({
    mutationFn: (params: { kmTotali: number; oreAttesa: number; anno: number }) =>
      simulaCalcoloStipendio(params),
    onError: (error: Error) => {
      toast({
        title: 'Errore simulazione',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
