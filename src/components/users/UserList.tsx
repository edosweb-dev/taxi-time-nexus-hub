
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, KeyRound, User, Mail, Building, UserCheck } from 'lucide-react';
import { Profile, UserRole } from '@/lib/types';
import { UserRoleFilter } from './UserRoleFilter';
import { UserDeleteConfirmDialog } from './UserDeleteConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface UserListProps {
  users: Profile[];
  onEdit: (user: Profile) => void;
  onDelete: (user: Profile) => void;
  onAddUser: () => void;
  onResetPassword?: (user: Profile) => void;
  currentUserId: string;
  title: string;
  description: string;
  showRoleFilter?: boolean;
  selectedRole?: UserRole | 'all';
  onRoleChange?: (role: UserRole | 'all') => void;
  showEmailColumn?: boolean;
  showAziendaColumn?: boolean;
  isDeleting?: boolean;
}

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'socio':
      return 'default';
    case 'dipendente':
      return 'secondary';
    case 'cliente':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'Amministratore';
    case 'socio':
      return 'Socio';
    case 'dipendente':
      return 'Dipendente';
    case 'cliente':
      return 'Cliente';
    default:
      return role;
  }
};

// Helper function to get user initials
const getUserInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || 'U';
};

export function UserList({
  users, 
  onEdit, 
  onDelete, 
  onAddUser, 
  onResetPassword,
  currentUserId, 
  title, 
  description,
  showRoleFilter = false,
  selectedRole = 'all',
  onRoleChange,
  showEmailColumn = false,
  showAziendaColumn = false,
  isDeleting = false
}: UserListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [isImpersonatingUser, setIsImpersonatingUser] = useState(false);
  const { startImpersonation, profile: currentProfile } = useAuth();

  const handleDeleteClick = (user: Profile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleImpersonate = async (user: Profile) => {
    if (confirm(`Sei sicuro di voler accedere come ${user.first_name} ${user.last_name}?`)) {
      try {
        setIsImpersonatingUser(true);
        await startImpersonation(user.id);
        toast({
          title: "Impersonificazione avviata",
          description: `Ora stai navigando come ${user.first_name} ${user.last_name}`,
        });
      } catch (error) {
        console.error('Failed to start impersonation:', error);
        toast({
          title: "Errore",
          description: "Impossibile avviare l'impersonificazione",
          variant: "destructive",
        });
      } finally {
        setIsImpersonatingUser(false);
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      onDelete(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="subsection-title flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                {title}
              </CardTitle>
              <p className="text-body-sm">
                {description} • {users.length} utent{users.length !== 1 ? 'i' : 'e'}
              </p>
            </div>
            <Button onClick={onAddUser} size="lg" className="shadow-md">
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Utente
            </Button>
          </div>
          
          {showRoleFilter && onRoleChange && (
            <div className="pt-4">
              <UserRoleFilter
                selectedRole={selectedRole}
                onRoleChange={onRoleChange}
              />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nessun utente trovato
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Non ci sono utenti che corrispondono ai criteri di ricerca
              </p>
              <Button onClick={onAddUser} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi il primo utente
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold">Ruolo</TableHead>
                    {showEmailColumn && (
                      <TableHead className="font-semibold">Email</TableHead>
                    )}
                    {showAziendaColumn && (
                      <TableHead className="font-semibold">Azienda</TableHead>
                    )}
                    <TableHead className="text-right font-semibold w-[200px]">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-muted/50 transition-colors border-b"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarFallback 
                              className="text-white font-semibold" 
                              style={{ 
                                backgroundColor: user.color || '#3B82F6' 
                              }}
                            >
                              {getUserInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          {user.color && ['admin', 'socio', 'dipendente'].includes(user.role) && (
                            <div 
                              className="w-4 h-4 rounded-full border border-border shadow-sm"
                              style={{ backgroundColor: user.color }}
                              title={`Colore calendario: ${user.color}`}
                            />
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          {!showEmailColumn && user.email && (
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={getRoleBadgeVariant(user.role)}
                          className="font-medium"
                        >
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      
                      {showEmailColumn && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">
                              {user.email || 'Non disponibile'}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      
                      {showAziendaColumn && (
                        <TableCell>
                          {user.aziende?.nome ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{user.aziende.nome}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Nessuna azienda</span>
                          )}
                        </TableCell>
                      )}
                      
                       <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                           {onResetPassword && (
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => onResetPassword(user)}
                               title="Reset Password"
                               className="hover:bg-amber-50 hover:text-amber-700"
                             >
                               <KeyRound className="h-4 w-4" />
                             </Button>
                           )}
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => onEdit(user)}
                             className="hover:bg-blue-50 hover:text-blue-700"
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           {currentProfile?.role === 'admin' && user.id !== currentUserId && (
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleImpersonate(user)}
                               disabled={isImpersonatingUser}
                               title="Accedi come questo utente"
                               className="hover:bg-green-50 hover:text-green-700"
                             >
                               <UserCheck className="h-4 w-4" />
                             </Button>
                           )}
                           {user.id !== currentUserId && (
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDeleteClick(user)}
                               disabled={isDeleting}
                               className="hover:bg-red-50 hover:text-red-700"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           )}
                         </div>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserDeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        user={userToDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}
