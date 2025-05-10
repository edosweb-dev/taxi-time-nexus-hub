
import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser, UserFormData } from '@/lib/api/users';
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
    queryFn: async () => {
      console.log('[useUsers] Iniziando la query per recuperare gli utenti');
      try {
        const users = await getUsers();
        console.log(`[useUsers] Query completata, ricevuti ${users.length} utenti`);
        return users;
      } catch (err) {
        console.error('[useUsers] Errore durante la query degli utenti:', err);
        throw err;
      }
    },
  });

  // Log quando i dati cambiano
  useEffect(() => {
    if (users && users.length > 0) {
      console.log(`[useUsers] Dati utenti aggiornati, numero utenti: ${users.length}`);
      console.log('[useUsers] Primi 3 utenti:', users.slice(0, 3));
    } else if (users && users.length === 0) {
      console.log('[useUsers] Nessun utente disponibile nell\'array users');
    }
  }, [users]);

  const createUserMutation = useMutation({
    mutationFn: (userData: UserFormData) => createUser(userData),
    onSuccess: (data) => {
      if (data.user) {
        console.log('[useUsers] Creazione utente riuscita:', data.user);
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Utente creato con successo');
      } else {
        console.error('Error creating user:', data.error);
        let errorMessage = 'Si è verificato un errore';
        
        // Add more specific error messages based on the error
        if (data.error?.message) {
          if (data.error.message.includes('Campi obbligatori mancanti')) {
            errorMessage = 'Assicurati di compilare tutti i campi richiesti';
          } else if (data.error.message.includes('already registered')) {
            errorMessage = 'Email già registrata, scegli un\'altra email';
          } else if (data.error.message.includes('password')) {
            errorMessage = 'La password non soddisfa i requisiti di sicurezza';
          } else if (data.error.message.includes('role')) {
            errorMessage = 'Errore con il ruolo utente';
          } else if (data.error.message.includes('foreign key constraint')) {
            errorMessage = 'Errore con i riferimenti nel database';
          } else if (data.error.message.includes('row-level security')) {
            errorMessage = 'Errore di permessi: controlla le policy RLS in Supabase';
          } else if (data.error.code === 'email_address_invalid') {
            errorMessage = 'Indirizzo email non valido';
          } else if (data.error.message.includes('Profilo non creato')) {
            errorMessage = 'Il profilo utente non è stato creato nel database';
          } else {
            errorMessage = data.error.message;
          }
        }
        
        toast.error(`Errore nella creazione dell'utente: ${errorMessage}`);
      }
    },
    onError: (error: any) => {
      console.error('Error creating user:', error);
      // Aggiunta gestione specifica per errori di autenticazione Supabase
      let errorMessage = error.message || 'Si è verificato un errore';
      
      // Gestione degli errori comuni di Supabase Auth
      if (error.code === 'auth/email-already-in-use' || 
          error.message?.includes('already been registered')) {
        errorMessage = 'Email già registrata, scegli un\'altra email';
      } else if (error.code === 'auth/weak-password' || 
                error.message?.includes('password')) {
        errorMessage = 'La password non soddisfa i requisiti di sicurezza';
      } else if (error.message?.includes('service_role')) {
        errorMessage = 'Errore di permessi: questa operazione richiede privilegi elevati';
      }
      
      toast.error(`Errore nella creazione dell'utente: ${errorMessage}`);
    },
    onSettled: () => {
      console.log('[useUsers] Invalidando la cache della query users dopo la mutation');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: Partial<UserFormData> }) => {
      console.log("[useUsers] Updating user mutation:", id, userData);
      console.log("[useUsers] Role being sent for update:", userData.role);
      return updateUser(id, userData);
    },
    onSuccess: (data) => {
      if (data.success) {
        console.log("[useUsers] User update successful, invalidating cache");
        queryClient.invalidateQueries({ queryKey: ['users'] });
        toast.success('Utente aggiornato con successo');
      } else {
        console.error('Error updating user:', data.error);
        let errorMessage = 'Si è verificato un errore';
        
        if (data.error?.message) {
          if (data.error.message.includes('role')) {
            errorMessage = 'Errore con il ruolo utente';
          } else if (data.error.message.includes('foreign key constraint')) {
            errorMessage = 'Errore con i riferimenti nel database';
          } else if (data.error.message.includes('row-level security')) {
            errorMessage = 'Errore di permessi: controlla le policy RLS in Supabase';
          } else {
            errorMessage = data.error.message;
          }
        }
        
        toast.error(`Errore nell'aggiornamento dell'utente: ${errorMessage}`);
      }
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast.error(`Errore nell'aggiornamento dell'utente: ${error.message || 'Si è verificato un errore'}`);
    },
    onSettled: () => {
      console.log('[useUsers] Invalidando la cache della query users dopo update');
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
    onSettled: () => {
      console.log('[useUsers] Invalidando la cache della query users dopo delete');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users,
    isLoading,
    isError,
    error,
    createUser: (userData: UserFormData) => createUserMutation.mutate(userData),
    updateUser: (id: string, userData: Partial<UserFormData>) => {
      console.log("[useUsers] Calling updateUser with:", id, userData);
      console.log("[useUsers] Role being updated to:", userData.role);
      updateUserMutation.mutate({ id, userData });
    },
    deleteUser: (id: string) => deleteUserMutation.mutate(id),
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}
