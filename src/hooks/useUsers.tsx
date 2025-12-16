
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUserById, createUser, updateUser, backupAndDeleteUser, resetUserPassword, UserFormData } from '@/lib/api/users';
import { toast } from '@/components/ui/sonner';
import { Profile } from '@/lib/types';

export function useUsers(options?: { 
  excludeRoles?: string[];
  includeRoles?: string[];
}) {
  const queryClient = useQueryClient();

  const {
    data: allUsers = [],
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
    staleTime: 10 * 60 * 1000, // 10 minuti - dati statici
  });

  // Apply filtering based on options
  const users = allUsers.filter(user => {
    if (options?.excludeRoles && options.excludeRoles.includes(user.role)) {
      return false;
    }
    if (options?.includeRoles && !options.includeRoles.includes(user.role)) {
      return false;
    }
    return true;
  });

  const getUserDetails = (id: string) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => getUserById(id),
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minuti - dati statici
    });
  };

  const createUserMutation = useMutation({
    mutationFn: (userData: UserFormData) => createUser(userData),
    onSuccess: (data) => {
      if (data.user) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Utente creato con successo');
      } else if (data.error) {
        const errorMessage = typeof data.error === 'string' ? data.error : data.error.message || 'Errore sconosciuto';
        toast.error(`Errore nella creazione dell'utente: ${errorMessage}`);
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
    mutationFn: (id: string) => backupAndDeleteUser(id),
    onSuccess: (data) => {
      if (data.success && data.data) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        const summary = data.data.summary;
        const totalRecords = summary.servizi + summary.stipendi + summary.spese + summary.turni + summary.movimenti + summary.spese_aziendali;
        
        toast.success(`Utente ${data.data.deleted_user} eliminato con successo. Backup di ${totalRecords} record creato.`);
      } else if (data.error) {
        toast.error(`Errore nell'eliminazione dell'utente: ${data.error.message || 'Si è verificato un errore'}`);
      }
    },
    onError: (error: any) => {
      console.error('Error deleting user:', error);
      toast.error(`Errore nell'eliminazione dell'utente: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => resetUserPassword(email),
    onSuccess: (data, email) => {
      if (data.success) {
        toast.success(`Email di reset password inviata a ${email}`);
      } else if (data.error) {
        toast.error(`Errore nell'invio dell'email: ${data.error.message}`);
      }
    },
    onError: (error: any, email) => {
      console.error('Error resetting password:', error);
      toast.error(`Errore nell'invio dell'email di reset a ${email}: ${error.message || 'Si è verificato un errore'}`);
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
    resetPassword: (email: string) => resetPasswordMutation.mutate(email),
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}
