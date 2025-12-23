
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import {
  getVeicoli,
  getVeicoliAttivi,
  getVeicoloById,
  createVeicolo,
  updateVeicolo,
  deleteVeicolo,
  deactivateVeicolo,
  reactivateVeicolo,
  hardDeleteVeicolo,
} from '@/lib/api/veicoli';
import { CreateVeicoloRequest, UpdateVeicoloRequest } from '@/lib/types/veicoli';

export function useVeicoli() {
  const { data: veicoli = [], isLoading, error, refetch } = useQuery({
    queryKey: ['veicoli'],
    queryFn: getVeicoli,
    staleTime: 10 * 60 * 1000, // 10 minuti - dati statici
  });

  return { veicoli, isLoading, error, refetch };
}

export function useVeicoliAttivi() {
  const { data: veicoli = [], isLoading, error } = useQuery({
    queryKey: ['veicoli', 'attivi'],
    queryFn: getVeicoliAttivi,
    staleTime: 10 * 60 * 1000, // 10 minuti - dati statici
  });

  return { veicoli, isLoading, error };
}

export function useVeicolo(id?: string) {
  return useQuery({
    queryKey: ['veicoli', id],
    queryFn: () => getVeicoloById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minuti - dati statici
  });
}

export function useCreateVeicolo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVeicolo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
      toast.success('Veicolo creato con successo');
    },
    onError: (error: any) => {
      console.error('Error creating veicolo:', error);
      toast.error('Errore nella creazione del veicolo');
    },
  });
}

export function useUpdateVeicolo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVeicoloRequest }) =>
      updateVeicolo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
      toast.success('Veicolo aggiornato con successo');
    },
    onError: (error: any) => {
      console.error('Error updating veicolo:', error);
      toast.error('Errore nell\'aggiornamento del veicolo');
    },
  });
}

export function useDeleteVeicolo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVeicolo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
      toast.success('Veicolo disattivato con successo');
    },
    onError: (error: any) => {
      console.error('Error deleting veicolo:', error);
      toast.error('Errore nella disattivazione del veicolo');
    },
  });
}

export function useDeactivateVeicolo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateVeicolo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
      toast.success('Veicolo disattivato');
    },
    onError: (error: any) => {
      console.error('Error deactivating veicolo:', error);
      toast.error('Errore nella disattivazione del veicolo');
    },
  });
}

export function useReactivateVeicolo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateVeicolo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
      toast.success('Veicolo riattivato');
    },
    onError: (error: any) => {
      console.error('Error reactivating veicolo:', error);
      toast.error('Errore nella riattivazione del veicolo');
    },
  });
}

export function useHardDeleteVeicolo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hardDeleteVeicolo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veicoli'] });
      toast.success('Veicolo eliminato definitivamente');
    },
    onError: (error: any) => {
      console.error('Error hard deleting veicolo:', error);
      toast.error('Errore nell\'eliminazione del veicolo');
    },
  });
}
