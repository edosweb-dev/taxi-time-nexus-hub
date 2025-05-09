
import { useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { UserList } from "@/components/users/UserList";
import { UserDialog } from "@/components/users/UserDialog";
import { UserDeleteDialog } from "@/components/users/UserDeleteDialog";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/lib/types";
import { UserFormData } from "@/lib/usersApi";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
  const { user } = useAuth();
  const {
    users,
    isLoading,
    isError,
    createUser,
    updateUser,
    deleteUser,
    isCreating,
    isUpdating,
    isDeleting,
  } = useUsers();

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (user: Profile) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitUser = (data: UserFormData) => {
    if (selectedUser) {
      updateUser(selectedUser.id, data);
    } else {
      createUser(data);
    }
    setIsUserDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
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
    return (
      <MainLayout>
        <div className="text-center p-12 text-destructive">
          Si è verificato un errore nel caricamento degli utenti. Si prega di riprovare più tardi.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestione Utenti</h1>
        
        <UserList
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onAddUser={handleAddUser}
          currentUserId={user?.id || ""}
        />
        
        <UserDialog
          isOpen={isUserDialogOpen}
          onOpenChange={setIsUserDialogOpen}
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
