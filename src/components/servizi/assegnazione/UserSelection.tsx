import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AssignmentUser } from '@/hooks/useAssignmentUsers';

interface UserSelectionProps {
  users: AssignmentUser[];
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
  mobile?: boolean;
  hasShiftsConfigured: boolean;
}

export function UserSelection({ 
  users, 
  selectedUserId, 
  onUserSelect, 
  mobile = false,
  hasShiftsConfigured 
}: UserSelectionProps) {
  
  if (users.length === 0) {
    return (
      <div className="no-users-available">
        <div className="text-center py-8 px-4">
          <p className="text-muted-foreground mb-2 font-medium">
            Nessun dipendente trovato
          </p>
          <p className="text-sm text-muted-foreground">
            Non ci sono dipendenti configurati nel sistema
          </p>
        </div>
      </div>
    );
  }

  const availableUsers = users.filter(u => u.isRecommended);
  const unavailableUsers = users.filter(u => !u.isRecommended);

  return (
    <div className="user-selection space-y-4">
      {!hasShiftsConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> Nessun turno configurato per questa data. 
            Tutti i dipendenti sono mostrati come disponibili.
          </p>
        </div>
      )}

      <RadioGroup value={selectedUserId} onValueChange={onUserSelect}>
        <div className={`users-list space-y-4 ${mobile ? 'max-h-[50vh] overflow-y-auto pr-2' : ''}`}>
          
          {/* Available Users Section */}
          {availableUsers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground px-1">
                Disponibili • {availableUsers.length}
              </div>
              {availableUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  selectedUserId={selectedUserId}
                  mobile={mobile}
                />
              ))}
            </div>
          )}

          {/* Unavailable Users Section */}
          {unavailableUsers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground px-1">
                Non disponibili • {unavailableUsers.length}
              </div>
              {unavailableUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  selectedUserId={selectedUserId}
                  mobile={mobile}
                  disabled
                />
              ))}
            </div>
          )}
        </div>
      </RadioGroup>

      {availableUsers.length === 0 && unavailableUsers.length > 0 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Attenzione:</strong> Nessun dipendente disponibile. 
            Puoi comunque assegnare il servizio, ma controlla la disponibilità manualmente.
          </p>
        </div>
      )}
    </div>
  );
}

interface UserCardProps {
  user: AssignmentUser;
  selectedUserId: string;
  mobile?: boolean;
  disabled?: boolean;
}

function UserCard({ user, selectedUserId, mobile = false, disabled = false }: UserCardProps) {
  const isSelected = selectedUserId === user.id;
  
  return (
    <div className="user-option flex items-start gap-3">
      <RadioGroupItem
        value={user.id}
        id={user.id}
        disabled={disabled}
        className="mt-4 flex-shrink-0"
      />
      <label
        htmlFor={user.id}
        className={`
          user-card flex-1 flex items-center justify-between p-4 
          border-2 rounded-lg cursor-pointer transition-all duration-200
          ${mobile ? 'min-h-[4rem]' : 'min-h-[3.5rem]'}
          ${isSelected 
            ? 'border-primary bg-primary/5' 
            : disabled
              ? 'border-muted bg-muted/20 cursor-not-allowed opacity-60'
              : 'border-border bg-background hover:border-muted-foreground hover:bg-muted/30'
          }
        `}
      >
        <div className="user-info flex items-center gap-3 flex-1">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="text-sm font-medium">
              {(user.first_name || '').charAt(0)}{(user.last_name || '').charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="user-details flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="user-name font-semibold text-sm truncate">
              {user.first_name} {user.last_name}
            </span>
            <span className="user-role text-xs text-muted-foreground capitalize">
              {user.role === 'admin' ? 'Amministratore' : 
               user.role === 'socio' ? 'Socio' : 'Dipendente'}
            </span>
            {user.email && (
              <span className="user-email text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            )}
          </div>
        </div>
        
        <div className="user-status flex flex-col items-end gap-1 flex-shrink-0">
          <Badge
            variant={user.isRecommended ? 'default' : 'secondary'}
            className={`text-xs px-2 py-1 ${
              user.isRecommended 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-red-100 text-red-800 border-red-200'
            }`}
          >
            {user.displayStatus}
          </Badge>
        </div>
      </label>
    </div>
  );
}