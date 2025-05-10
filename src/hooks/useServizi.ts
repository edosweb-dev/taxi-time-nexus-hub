
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createServizio, getServizi, getServizioById } from '@/lib/api/servizi';
import { CreateServizioRequest } from '@/lib/api/servizi/types';
import { toast } from '@/components/ui/sonner';

export function useServizi() {
  const queryClient = useQueryClient();

  const {
    data: servizi = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['servizi'],
    queryFn: getServizi,
  });

  const createServizioMutation = useMutation({
    mutationFn: (data: CreateServizioRequest) => createServizio(data),
    onSuccess: (data) => {
      if (data.servizio) {
        queryClient.invalidateQueries({ queryKey: ['servizi'] });
        toast.success('Servizio creato con successo');
        return data.servizio;
      } else if (data.error) {
        toast.error(`Errore nella creazione del servizio: ${data.error.message}`);
        throw data.error;
      }
    },
    onError: (error: any) => {
      console.error('Error creating servizio:', error);
      toast.error(`Errore nella creazione del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  return {
    servizi,
    isLoading,
    isError,
    error,
    refetch,
    createServizio: (data: CreateServizioRequest) => createServizioMutation.mutate(data),
    isCreating: createServizioMutation.isPending
  };
}

export function useServizio(id?: string) {
  return useQuery({
    queryKey: ['servizio', id],
    queryFn: () => getServizioById(id!),
    enabled: !!id
  });
}
