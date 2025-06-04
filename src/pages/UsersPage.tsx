
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { UserList } from '@/components/users/UserList';
import { UserSheet } from '@/components/users/UserSheet';
import { ChevronRight, Home } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Profile, UserRole } from '@/lib/types';
import { UserFormData } from '@/lib/api/users/types';
import { toast } from '@/components/ui/use-toast';
import { createUser, updateUser, resetUserPassword } from '@/lib/api/users';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedbackButton } from '@/components/feedback';

export default function UsersPage() {
  const { users, isLoading, refetch, deleteUser, isDeleting } = useUsers();
  const { profile } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsSheetOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const handleDeleteUser = async (user: Profile) => {
    console.log('Deleting user with backup:', user.id);
    deleteUser(user.id);
  };

  const handleResetPassword = async (user: Profile) => {
    if (!user.email) {
      toast({
        title: "Errore",
        description: "Email non disponibile per questo utente.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Sei sicuro di voler inviare un'email di reset password a ${user.email}?`)) {
      try {
        const { success, error } = await resetUserPassword(user.email);
        
        if (success) {
          toast({
            title: "Email inviata",
            description: `Un'email di reset password è stata inviata a ${user.email}.`,
          });
        } else {
          toast({
            title: "Errore",
            description: error?.message || "Si è verificato un errore durante l'invio dell'email.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'invio dell'email di reset.",
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
      setIsSheetOpen(false);
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

  // Filter users by role
  const clienti = users.filter(user => user.role === 'cliente');
  const utenti = users.filter(user => ['admin', 'socio', 'dipendente'].includes(user.role));
  
  // Filter utenti based on selected role
  const filteredUtenti = selectedRole === 'all' 
    ? utenti 
    : utenti.filter(user => user.role === selectedRole);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/30 relative">
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

          <Tabs defaultValue="utenti" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="utenti">Utenti</TabsTrigger>
              <TabsTrigger value="clienti">Clienti</TabsTrigger>
            </TabsList>
            
            <TabsContent value="utenti" className="space-y-4">
              <UserList 
                users={filteredUtenti}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onAddUser={handleAddUser}
                onResetPassword={handleResetPassword}
                currentUserId={profile?.id || ''}
                title="Utenti"
                description="Amministratori, soci e dipendenti"
                showRoleFilter={true}
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
                isDeleting={isDeleting}
              />
            </TabsContent>
            
            <TabsContent value="clienti" className="space-y-4">
              <UserList 
                users={clienti}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onAddUser={handleAddUser}
                onResetPassword={handleResetPassword}
                currentUserId={profile?.id || ''}
                title="Clienti"
                description="Utenti clienti del sistema"
                showEmailColumn={true}
                isDeleting={isDeleting}
              />
            </TabsContent>
          </Tabs>

          <UserSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onSubmit={handleSubmit}
            user={selectedUser}
            isSubmitting={isSubmitting}
          />
        </div>
        
        {/* Feedback button posizionato all'interno della sezione */}
        <FeedbackButton />
      </div>
    </MainLayout>
  );
}
