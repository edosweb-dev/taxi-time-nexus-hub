
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAziende } from '@/hooks/useAziende';
import { useUsers } from '@/hooks/useUsers';
import { Profile, Azienda, UserRole } from '@/lib/types';
import { toast } from '@/components/ui/sonner';
import { UserFormData } from '@/lib/api/users/types';
import { AziendaFormData } from '@/lib/api/aziende';

export function useAziendaDetail(id: string | undefined, currentUserID: string | undefined) {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('info');
  const [isAziendaSheetOpen, setIsAziendaSheetOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const { 
    getCompanyDetails, 
    updateCompany, 
    isUpdating 
  } = useAziende();
  
  const { 
    users, 
    isLoading: isLoadingUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    isCreating: isCreatingUser,
    isUpdating: isUpdatingUser,
    isDeleting: isDeletingUser 
  } = useUsers();

  const { data: azienda, isLoading, error } = getCompanyDetails(id || '');
  
  // Filtra gli utenti per mostrare solo quelli associati all'azienda e con ruolo 'cliente'
  const referenti = users.filter(user => user.azienda_id === id && user.role === 'cliente');

  useEffect(() => {
    if (error) {
      toast.error("Errore nel caricamento dei dati aziendali");
      navigate('/aziende');
    }
  }, [error, navigate]);

  const handleBack = () => {
    navigate('/aziende');
  };

  const handleEditAzienda = () => {
    setIsAziendaSheetOpen(true);
  };

  const handleSubmitAzienda = (data: AziendaFormData) => {
    if (id) {
      updateCompany(id, data);
      setIsAziendaSheetOpen(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (user: Profile) => {
    if (window.confirm(`Sei sicuro di voler eliminare ${user.first_name} ${user.last_name}?`)) {
      deleteUser(user.id);
    }
  };

  const handleSubmitUser = (userData: UserFormData) => {
    // Se stiamo modificando un utente esistente
    if (selectedUser) {
      updateUser(selectedUser.id, userData);
    } else {
      // Altrimenti stiamo creando un nuovo utente
      // Assicuriamoci che l'utente sia associato all'azienda corrente
      const userDataWithAzienda = {
        ...userData,
        azienda_id: id,
        role: 'cliente' as UserRole // Forza il ruolo a 'cliente'
      };
      
      createUser(userDataWithAzienda);
    }
    
    setIsUserDialogOpen(false);
  };

  return {
    azienda,
    isLoading,
    activeTab,
    setActiveTab,
    referenti,
    isLoadingUsers,
    isAziendaSheetOpen,
    setIsAziendaSheetOpen,
    isUserDialogOpen,
    setIsUserDialogOpen,
    selectedUser,
    handleBack,
    handleEditAzienda,
    handleSubmitAzienda,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleSubmitUser,
    isUpdating,
    isCreatingUser,
    isUpdatingUser,
    isDeletingUser
  };
}
