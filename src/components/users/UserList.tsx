
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  PencilIcon, 
  Trash2Icon, 
  UserPlusIcon, 
  UserIcon, 
  ShieldIcon, 
  Users2Icon, 
  ShoppingBagIcon 
} from 'lucide-react';
import { Profile } from '@/lib/types';

interface UserListProps {
  users: Profile[];
  onEdit: (user: Profile) => void;
  onDelete: (user: Profile) => void;
  onAddUser: () => void;
  currentUserId: string;
}

export function UserList({ users, onEdit, onDelete, onAddUser, currentUserId }: UserListProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldIcon className="h-4 w-4 text-red-500" />;
      case 'socio':
        return <Users2Icon className="h-4 w-4 text-indigo-500" />;
      case 'dipendente':
        return <UserIcon className="h-4 w-4 text-blue-500" />;
      case 'cliente':
        return <ShoppingBagIcon className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getRoleName = (role: string) => {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Utenti</h2>
        <Button onClick={onAddUser}>
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Nuovo Utente
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cognome</TableHead>
            <TableHead>Ruolo</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nessun utente trovato. Creane uno!
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.first_name || '-'}</TableCell>
                <TableCell>{user.last_name || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    {getRoleName(user.role)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Modifica</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => onDelete(user)}
                      disabled={user.id === currentUserId}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Elimina</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
