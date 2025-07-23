import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Azienda, Profile } from "@/lib/types";
import { useReferenti } from "@/hooks/useReferenti";
import { useUsers } from "@/hooks/useUsers";
import { UserDialog } from "@/components/users/UserDialog";
import { UserFormData } from "@/lib/api/users/types";
import { useState } from "react";
import { 
  Users, 
  User, 
  Mail, 
  Edit, 
  Trash2, 
  Plus, 
  Loader2 
} from "lucide-react";

interface ReferentiSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  azienda: Azienda;
}

export function ReferentiSheet({
  isOpen,
  onOpenChange,
  azienda,
}: ReferentiSheetProps) {
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const { data: referenti = [], isLoading, refetch } = useReferenti(azienda.id);
  const { createUser, updateUser, deleteUser, isCreating, isUpdating } = useUsers();

  // Helper function to get user initials
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (user: Profile) => {
    if (window.confirm(`Sei sicuro di voler eliminare ${user.first_name} ${user.last_name}?`)) {
      await deleteUser(user.id);
      refetch();
    }
  };

  const handleSubmitUser = async (userData: UserFormData) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, userData);
      } else {
        await createUser({
          ...userData,
          azienda_id: azienda.id,
          role: 'cliente' as const,
        });
      }
      setIsUserDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          <SheetHeader className="space-y-4 pb-6 border-b">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Users className="h-6 w-6" />
              </div>
              
              <div className="flex-1 space-y-2">
                <SheetTitle className="section-title">
                  Referenti Aziendali
                </SheetTitle>
                <div className="text-sm text-muted-foreground">
                  {azienda.nome}
                </div>
              </div>
              
              <Button
                onClick={handleAddUser}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Aggiungi
              </Button>
            </div>
            
            <SheetDescription className="text-left">
              Gestisci i referenti aziendali per {azienda.nome}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 pt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Caricamento referenti...</span>
              </div>
            ) : referenti.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun referente presente</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Non ci sono referenti associati a questa azienda.
                </p>
                <Button onClick={handleAddUser} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Aggiungi il primo referente
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {referenti.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getUserInitials(user.first_name, user.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.first_name || user.last_name || 'Nome non specificato'
                            }
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {user.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Referente
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <UserDialog
        isOpen={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        onSubmit={handleSubmitUser}
        user={selectedUser}
        isSubmitting={isCreating || isUpdating}
        defaultRole="cliente"
        hiddenRoles={['admin', 'socio', 'dipendente']}
        isNewUser={!selectedUser}
        preselectedAzienda={azienda}
      />
    </>
  );
}