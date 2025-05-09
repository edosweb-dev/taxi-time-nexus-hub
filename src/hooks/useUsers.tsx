
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser, UserFormData } from '@/lib/usersApi';
import { toast } from '@/components/ui/sonner';

export function useUsers() {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: UserFormData) => createUser(userData),
    onSuccess: (data) => {
      if (data.user) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Utente creato con successo');
      } else {
        console.error('Error creating user:', data.error);
        toast.error(`Errore nella creazione dell'utente: ${data.error?.message || 'Si è verificato un errore'}`);
      }
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast.error(`Errore nella creazione dell'utente: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<UserFormData> }) => 
      updateUser(id, userData),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Utente aggiornato con successo');
      } else {
        console.error('Error updating user:', data.error);
        toast.error(`Errore nell'aggiornamento dell'utente: ${data.error?.message || 'Si è verificato un errore'}`);
      }
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(`Errore nell'aggiornamento dell'utente: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Utente eliminato con successo');
      } else {
        console.error('Error deleting user:', data.error);
        toast.error(`Errore nell'eliminazione dell'utente: ${data.error?.message || 'Si è verificato un errore'}`);
      }
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      toast.error(`Errore nell'eliminazione dell'utente: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  return {
    users,
    isLoading,
    isError,
    error,
    createUser: (userData: UserFormData) => createUserMutation.mutate(userData),
    updateUser: (id: string, userData: Partial<UserFormData>) => 
      updateUserMutation.mutate({ id, userData }),
    deleteUser: (id: string) => deleteUserMutation.mutate(id),
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}
