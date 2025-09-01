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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
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
  
  // Debug logging
  console.log('[useAziendaDetail] All users:', users.length);
  console.log('[useAziendaDetail] Company ID:', id);
  console.log('[useAziendaDetail] Filtered referenti:', referenti.length, referenti.map(r => ({ id: r.id, name: `${r.first_name} ${r.last_name}`, email: r.email })));

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
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSubmitAzienda = async (data: AziendaFormData) => {
    if (id) {
      await updateCompany(id, data);
      setIsEditMode(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserSheetOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setIsUserSheetOpen(true);
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
    
    setIsUserSheetOpen(false);
  };

  return {
    azienda,
    isLoading,
    activeTab,
    setActiveTab,
    referenti,
    isLoadingUsers,
    isEditMode,
    setIsEditMode,
    isUserSheetOpen,
    setIsUserSheetOpen,
    selectedUser,
    handleBack,
    handleEditAzienda,
    handleCancelEdit,
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