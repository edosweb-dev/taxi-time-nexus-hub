
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Edit, Trash2, User, Mail, Users } from "lucide-react";

interface ReferentiTableProps {
  referenti: Profile[];
  isLoadingUsers: boolean;
  currentUserID: string | undefined;
  onEditUser: (user: Profile) => void;
  onDeleteUser: (user: Profile) => void;
  onAddUser: () => void;
}

export function ReferentiTable({
  referenti,
  isLoadingUsers,
  currentUserID,
  onEditUser,
  onDeleteUser,
  onAddUser,
}: ReferentiTableProps) {
  // Helper function to get user initials
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  if (isLoadingUsers) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Caricamento referenti...</span>
      </div>
    );
  }

  if (referenti.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Users className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun referente</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Non ci sono referenti associati a questa azienda.
        </p>
        <Button onClick={onAddUser} className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Aggiungi il primo referente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {referenti.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getUserInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.first_name || user.last_name || 'Nome non specificato'
                  }
                </h4>
                {user.id === currentUserID && (
                  <Badge variant="secondary" className="text-xs">
                    Tu
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {user.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  {user.role === 'cliente' ? 'Referente' : user.role}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditUser(user)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifica
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              onClick={() => onDeleteUser(user)}
              disabled={user.id === currentUserID}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
