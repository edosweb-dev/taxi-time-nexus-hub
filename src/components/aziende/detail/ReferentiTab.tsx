
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Profile, Azienda } from '@/lib/types';
import { UserDialog } from '@/components/users/UserDialog';
import { UserFormData } from '@/lib/api/users/types';
import { ReferentiTable } from './ReferentiTable';

interface ReferentiTabProps {
  azienda: Azienda;
  referenti: Profile[];
  isLoadingUsers: boolean;
  currentUserID: string | undefined;
  onAddUser: () => void;
  onEditUser: (user: Profile) => void;
  onDeleteUser: (user: Profile) => void;
  isUserDialogOpen: boolean;
  setIsUserDialogOpen: (open: boolean) => void;
  selectedUser: Profile | null;
  onSubmitUser: (data: UserFormData) => void;
  isCreatingUser: boolean;
  isUpdatingUser: boolean;
}

export function ReferentiTab({
  azienda,
  referenti,
  isLoadingUsers,
  currentUserID,
  onAddUser,
  onEditUser,
  onDeleteUser,
  isUserDialogOpen,
  setIsUserDialogOpen,
  selectedUser,
  onSubmitUser,
  isCreatingUser,
  isUpdatingUser
}: ReferentiTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Referenti Aziendali</CardTitle>
        <Button onClick={onAddUser}>
          Aggiungi Referente
        </Button>
      </CardHeader>
      <CardContent>
        <ReferentiTable 
          referenti={referenti}
          isLoadingUsers={isLoadingUsers}
          currentUserID={currentUserID}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
          onAddUser={onAddUser}
        />
      </CardContent>
      
      <UserDialog
        isOpen={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        onSubmit={onSubmitUser}
        user={selectedUser}
        isSubmitting={isCreatingUser || isUpdatingUser}
        defaultRole="cliente"
        hiddenRoles={['admin', 'socio', 'dipendente']}
        isNewUser={!selectedUser}
        preselectedAzienda={azienda}
      />
    </Card>
  );
}
