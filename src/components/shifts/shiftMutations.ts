
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { ShiftFormData } from './types';
import { createShiftApi, updateShiftApi, deleteShiftApi } from './shiftApi';

export const useShiftMutations = (userId?: string) => {
  const queryClient = useQueryClient();

  // Mutation for creating a shift
  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftFormData) => {
      if (!userId) throw new Error('Utente non autenticato');
      return createShiftApi(data, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno creato con successo');
    },
    onError: (error) => {
      console.error('Error creating shift:', error);
      toast.error('Errore nella creazione del turno');
    },
  });

  // Mutation for updating a shift
  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ShiftFormData }) => {
      if (!userId) throw new Error('Utente non autenticato');
      return updateShiftApi(id, data, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno aggiornato con successo');
    },
    onError: (error) => {
      console.error('Error updating shift:', error);
      toast.error('Errore nell\'aggiornamento del turno');
    },
  });

  // Mutation for deleting a shift
  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteShiftApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno eliminato con successo');
    },
    onError: (error) => {
      console.error('Error deleting shift:', error);
      toast.error('Errore nell\'eliminazione del turno');
    },
  });

  return {
    createShiftMutation,
    updateShiftMutation,
    deleteShiftMutation,
  };
};
