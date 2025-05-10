import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUserById, createUser, updateUser, deleteUser, UserFormData } from '@/lib/api/users';
import { toast } from '@/components/ui/sonner';
import { User } from '@/lib/types';

export function useUsers() {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('[useUsers] Fetching users');
      try {
        const users = await getUsers();
        console.log(`[useUsers] Query completed, received ${users.length} users`);
        return users;
      } catch (err) {
        console.error('[useUsers] Error during users query:', err);
        throw err;
      }
    },
  });

  const getUserDetails = (id: string) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => getUserById(id),
      enabled: !!id
    });
  };

  const createUserMutation = useMutation({
    mutationFn: (userData: UserFormData) => createUser(userData),
    onSuccess: (data) => {
      if (data.user) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Utente creato con successo');
      } else if (data.error) {
        toast.error(`Errore nella creazione dell'utente: ${data.error.message}`);
      }
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      toast.error(`Errore nella creazione dell'utente: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) => updateUser(id, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast.success('Utente aggiornato con successo');
      } else if (data.error) {
        toast.error(`Errore nell'aggiornamento dell'utente: ${data.error.message}`);
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
      } else if (data.error) {
        toast.error(`Errore nell'eliminazione dell'utente: ${data.error.message}`);
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
    refetch,
    getUserDetails,
    createUser: (data: UserFormData) => createUserMutation.mutate(data),
    updateUser: (id: string, data: Partial<UserFormData>) => updateUserMutation.mutate({ id, data }),
    deleteUser: (id: string) => deleteUserMutation.mutate(id),
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}
