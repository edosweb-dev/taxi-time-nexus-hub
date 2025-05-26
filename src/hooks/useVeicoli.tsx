
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import {
  getVeicoli,
  getVeicoliAttivi,
  getVeicoloById,
  createVeicolo,
  updateVeicolo,
  deleteVeicolo,
} from '@/lib/api/veicoli';
import { CreateVeicoloRequest, UpdateVeicoloRequest } from '@/lib/types/veicoli';

export function useVeicoli() {
  const { data: veicoli = [], isLoading, error, refetch } = useQuery({
    queryKey: ['veicoli'],
    queryFn: getVeicoli,
  });

  return { veicoli, isLoading, error, refetch };
}

export function useVeicoliAttivi() {
  const { data: veicoli = [], isLoading, error } = useQuery({
    queryKey: ['veicoli', 'attivi'],
    queryFn: getVeicoliAttivi,
  });

  return { veicoli, isLoading, error };
}

export function useVeicolo(id?: string) {
  return useQuery({
    queryKey: ['veicoli', id],
    queryFn: () => getVeicoloById(id!),
    enabled: !!id,
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
