
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, KeyRound } from 'lucide-react';
import { Profile, UserRole } from '@/lib/types';
import { UserRoleFilter } from './UserRoleFilter';

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
  showEmailColumn = false
}: UserListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <Button onClick={onAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            Aggiungi Utente
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
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun utente trovato
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-foreground">
                        {user.first_name} {user.last_name}
                      </h3>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </div>
                    {showEmailColumn && (
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email || 'Email non disponibile'}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onResetPassword && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResetPassword(user)}
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.id !== currentUserId && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
