
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getImpostazioni, updateImpostazioni } from '@/lib/api/impostazioni';
import { UpdateImpostazioniRequest } from '@/lib/api/impostazioni/types';
import { toast } from '@/components/ui/sonner';

export function useImpostazioni() {
  const queryClient = useQueryClient();

  const {
    data: impostazioni,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['impostazioni'],
    queryFn: getImpostazioni,
  });

  const updateImpostazioniMutation = useMutation({
    mutationFn: (data: UpdateImpostazioniRequest) => updateImpostazioni(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['impostazioni'] });
      toast.success('Impostazioni aggiornate con successo');
    },
    onError: (error: any) => {
      console.error('Error updating impostazioni:', error);
      toast.error(`Errore nell'aggiornamento delle impostazioni: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  return {
    impostazioni,
    isLoading,
    isError,
    error,
    refetch,
    updateImpostazioni: (data: UpdateImpostazioniRequest) => updateImpostazioniMutation.mutate(data),
    isUpdating: updateImpostazioniMutation.isPending
  };
}
