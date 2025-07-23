import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createServizio, getServizi, getServizioById, completaServizio, consuntivaServizio, updateServizio } from '@/lib/api/servizi';
import { CreateServizioRequest, UpdateServizioRequest } from '@/lib/api/servizi/types';
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

  const completaServizioMutation = useMutation({
    mutationFn: completaServizio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      toast.success('Servizio completato con successo');
    },
    onError: (error: any) => {
      console.error('Error completing service:', error);
      toast.error(`Errore nel completamento del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const consuntivaServizioMutation = useMutation({
    mutationFn: consuntivaServizio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      toast.success('Servizio consuntivato con successo');
    },
    onError: (error: any) => {
      console.error('Error finalizing service:', error);
      toast.error(`Errore nella consuntivazione del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const updateServizioMutation = useMutation({
    mutationFn: (data: UpdateServizioRequest) => updateServizio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servizi'] });
      queryClient.invalidateQueries({ queryKey: ['servizio'] });
      toast.success('Servizio aggiornato con successo');
    },
    onError: (error: any) => {
      console.error('Error updating servizio:', error);
      toast.error(`Errore nell'aggiornamento del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  return {
    servizi,
    isLoading,
    isError,
    error,
    refetch,
    createServizio: (data: CreateServizioRequest) => createServizioMutation.mutate(data),
    updateServizio: (data: UpdateServizioRequest) => updateServizioMutation.mutate(data),
    updateStatoServizio: (id: string, stato: StatoServizio) => 
      updateStatoServizioMutation.mutate({ id, stato }),
    completaServizio: completaServizioMutation.mutate,
    consuntivaServizio: consuntivaServizioMutation.mutate,
    isCreating: createServizioMutation.isPending,
    isUpdating: updateStatoServizioMutation.isPending,
    isUpdatingServizio: updateServizioMutation.isPending,
    isCompletando: completaServizioMutation.isPending,
    isConsuntivando: consuntivaServizioMutation.isPending
  };
}

export function useServizio(id?: string) {
  return useQuery({
    queryKey: ['servizio', id],
    queryFn: () => getServizioById(id!),
    enabled: !!id
  });
}
