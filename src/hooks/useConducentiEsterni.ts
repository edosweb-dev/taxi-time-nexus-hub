import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import {
  getConducentiEsterni,
  getConducentiEsterniAttivi,
  createConducenteEsterno,
  updateConducenteEsterno,
  deleteConducenteEsterno,
  reactivateConducenteEsterno
} from '@/lib/api/conducenti-esterni';
import { CreateConducenteEsternoRequest, UpdateConducenteEsternoRequest } from '@/lib/types/conducenti-esterni';

export function useConducentiEsterni() {
  return useQuery({
    queryKey: ['conducenti-esterni'],
    queryFn: getConducentiEsterni,
  });
}

export function useConducentiEsterniAttivi() {
  return useQuery({
    queryKey: ['conducenti-esterni', 'attivi'],
    queryFn: getConducentiEsterniAttivi,
  });
}

export function useCreateConducenteEsterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConducenteEsterno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conducenti-esterni'] });
      toast.success('Conducente esterno creato con successo');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateConducenteEsterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateConducenteEsterno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conducenti-esterni'] });
      toast.success('Conducente esterno aggiornato con successo');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteConducenteEsterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConducenteEsterno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conducenti-esterni'] });
      toast.success('Conducente esterno disattivato con successo');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useReactivateConducenteEsterno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateConducenteEsterno,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conducenti-esterni'] });
      toast.success('Conducente esterno riattivato con successo');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}