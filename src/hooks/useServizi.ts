
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createServizio, getServizi, getServizioById } from '@/lib/api/servizi';
import { CreateServizioRequest } from '@/lib/api/servizi/types';
import { toast } from '@/components/ui/sonner';
import { StatoServizio } from '@/lib/types/servizi';
import { supabase } from '@/lib/supabase';

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

  const updateStatoServizioMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: StatoServizio }) => {
      const { data, error } = await supabase
        .from('servizi')
        .update({ stato })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data?.[0] || null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      toast.success('Stato del servizio aggiornato con successo');
    },
    onError: (error: any) => {
      console.error('Error updating service status:', error);
      toast.error(`Errore nell'aggiornamento dello stato: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  return {
    servizi,
    isLoading,
    isError,
    error,
    refetch,
    createServizio: (data: CreateServizioRequest) => createServizioMutation.mutate(data),
    updateStatoServizio: (id: string, stato: StatoServizio) => 
      updateStatoServizioMutation.mutate({ id, stato }),
    isCreating: createServizioMutation.isPending,
    isUpdating: updateStatoServizioMutation.isPending
  };
}

export function useServizio(id?: string) {
  return useQuery({
    queryKey: ['servizio', id],
    queryFn: () => getServizioById(id!),
    enabled: !!id
  });
}
