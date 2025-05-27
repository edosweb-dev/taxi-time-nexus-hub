
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { UserList } from '@/components/users/UserList';
import { UserDialog } from '@/components/users/UserDialog';
import { ChevronRight, Home } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Profile } from '@/lib/types';
import { UserFormData } from '@/lib/api/users/types';
import { toast } from '@/components/ui/use-toast';
import { createUser, updateUser, deleteUser } from '@/lib/api/users';

export default function UsersPage() {
  const { users, isLoading, refetch } = useUsers();
  const { profile } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (user: Profile) => {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      try {
        await deleteUser(user.id);
        toast({
          title: "Utente eliminato",
          description: "L'utente è stato eliminato con successo.",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione dell'utente.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await updateUser(selectedUser.id, data);
        toast({
          title: "Utente aggiornato",
          description: "L'utente è stato aggiornato con successo.",
        });
      } else {
        await createUser(data);
        toast({
          title: "Utente creato",
          description: "L'utente è stato creato con successo.",
        });
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dell'utente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Utenti</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Utenti</h1>
                <p className="text-muted-foreground text-lg">
                  Gestisci gli utenti del sistema
                </p>
              </div>
            </div>
          </div>

          <UserList 
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onAddUser={handleAddUser}
            currentUserId={profile?.id || ''}
          />

          <UserDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={handleSubmit}
            user={selectedUser}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
