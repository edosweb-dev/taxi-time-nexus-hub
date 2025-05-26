
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { UserList } from "@/components/users/UserList";
import { UserSheet } from "@/components/users/UserSheet";
import { UserDeleteDialog } from "@/components/users/UserDeleteDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/lib/types";
import { UserFormData } from "@/lib/usersApi";
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function UsersPage() {
  const { user } = useAuth();
  const location = useLocation();
  const {
    users,
    isLoading,
    isError,
    error,
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
    isDeleting,
  } = useUsers();

  // Log iniziale al caricamento della pagina
  useEffect(() => {
    console.log('[UsersPage] Pagina utenti caricata');
    console.log('[UsersPage] Stato auth.user:', user);
    console.log('[UsersPage] Current path:', location.pathname);
  }, [user, location]);

  // Monitora cambiamenti negli utenti
  useEffect(() => {
    if (isLoading) {
      console.log('[UsersPage] Caricamento utenti in corso...');
    } else if (isError) {
      console.error('[UsersPage] Errore nel caricamento degli utenti:', error);
    } else {
      console.log(`[UsersPage] Utenti caricati: ${users.length}`);
      
      if (users.length > 0) {
        console.log('[UsersPage] Esempio primo utente:', JSON.stringify(users[0]));
      } else {
        console.log('[UsersPage] Nessun utente disponibile');
      }
    }
  }, [users, isLoading, isError, error]);

  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<string>("clienti");

  // Filtra utenti per tipo
  const clientUsers = users.filter(user => user.role === 'cliente');
  const systemUsers = users.filter(user => ['admin', 'socio', 'dipendente'].includes(user.role));

  const handleAddUser = () => {
    console.log('[UsersPage] Avvio creazione nuovo utente');
    setSelectedUser(null);
    setIsUserSheetOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    console.log('[UsersPage] Modifica utente:', user);
    setSelectedUser(user);
    setIsUserSheetOpen(true);
  };

  const handleDeleteUser = (user: Profile) => {
    console.log('[UsersPage] Richiesta eliminazione utente:', user);
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitUser = (data: UserFormData) => {
    console.log('[UsersPage] Invio dati utente:', data);
    if (selectedUser) {
      console.log(`[UsersPage] Aggiornamento utente esistente ID: ${selectedUser.id}`);
      updateUser(selectedUser.id, data);
    } else {
      console.log('[UsersPage] Creazione nuovo utente');
      createUser(data);
    }
    setIsUserSheetOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      console.log(`[UsersPage] Eliminazione confermata per utente ID: ${selectedUser.id}`);
      deleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    console.log('[UsersPage] Rendering stato di caricamento');
    return (
      <MainLayout>
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Caricamento utenti...</span>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    console.error('[UsersPage] Rendering stato di errore:', error);
    return (
      <MainLayout>
        <div className="text-center p-12 text-destructive">
          Si è verificato un errore nel caricamento degli utenti. Si prega di riprovare più tardi.
          <div className="mt-2 text-sm text-muted-foreground">
            Dettaglio errore: {error instanceof Error ? error.message : 'Errore sconosciuto'}
          </div>
        </div>
      </MainLayout>
    );
  }

  console.log('[UsersPage] Rendering lista utenti con tabs, numero utenti:', users.length);
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestione Utenti</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="clienti">
              Clienti ({clientUsers.length})
            </TabsTrigger>
            <TabsTrigger value="sistema">
              Sistema ({systemUsers.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="clienti">
            <UserList
              users={clientUsers}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onAddUser={handleAddUser}
              currentUserId={user?.id || ""}
            />
          </TabsContent>
          
          <TabsContent value="sistema">
            <UserList
              users={systemUsers}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onAddUser={handleAddUser}
              currentUserId={user?.id || ""}
            />
          </TabsContent>
        </Tabs>
        
        <UserSheet
          isOpen={isUserSheetOpen}
          onOpenChange={setIsUserSheetOpen}
          onSubmit={handleSubmitUser}
          user={selectedUser}
          isSubmitting={isCreating || isUpdating}
        />
        
        <UserDeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          user={selectedUser}
          isDeleting={isDeleting}
        />
      </div>
    </MainLayout>
  );
}
