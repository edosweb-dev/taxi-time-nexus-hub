
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Edit } from 'lucide-react';
import { Profile, Azienda } from '@/lib/types';
import { UserDialog } from '@/components/users/UserDialog';
import { UserFormData } from '@/lib/api/users/types';

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
        {isLoadingUsers ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Caricamento referenti...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {referenti.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nessun referente associato a questa azienda.</p>
                <Button onClick={onAddUser} className="mt-4">
                  Aggiungi il primo referente
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Nome</th>
                    <th className="text-left py-2">Cognome</th>
                    <th className="text-right py-2">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {referenti.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-3">{user.first_name || '-'}</td>
                      <td className="py-3">{user.last_name || '-'}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Modifica</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => onDeleteUser(user)}
                            disabled={user.id === currentUserID}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Elimina</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
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
