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
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                Nessun turno configurato
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Tutti i dipendenti sono mostrati come disponibili per questa data.
              </p>
            </div>
          </div>
        </div>
      )}

      <RadioGroup value={selectedUserId} onValueChange={onUserSelect} className="space-y-1">
        <div className={`users-list space-y-4 ${mobile ? 'max-h-[45vh] overflow-y-auto pr-1' : 'max-h-[50vh] overflow-y-auto'}`}>
          
          {/* Available Users Section */}
          {availableUsers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                  Disponibili ({availableUsers.length})
                </span>
              </div>
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    selectedUserId={selectedUserId}
                    mobile={mobile}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unavailable Users Section */}
          {unavailableUsers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                  Non disponibili ({unavailableUsers.length})
                </span>
              </div>
              <div className="space-y-2">
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
            </div>
          )}
        </div>
      </RadioGroup>

      {availableUsers.length === 0 && unavailableUsers.length > 0 && (
        <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                Nessun dipendente disponibile
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Puoi comunque assegnare il servizio, ma controlla la disponibilità manualmente.
              </p>
            </div>
          </div>
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
    <div className="user-option flex items-start gap-3 w-full group">
      <RadioGroupItem
        value={user.id}
        id={user.id}
        disabled={disabled}
        className="mt-4 flex-shrink-0 data-[state=checked]:border-primary data-[state=checked]:text-primary"
      />
      <label
        htmlFor={user.id}
        className={`
          user-card flex-1 flex items-center justify-between p-4 min-w-0
          border rounded-xl cursor-pointer transition-all duration-300 group
          ${mobile ? 'min-h-[4rem]' : 'min-h-[3.5rem]'}
          ${isSelected 
            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-lg' 
            : disabled
              ? 'border-muted bg-muted/10 cursor-not-allowed opacity-50'
              : 'border-border bg-background hover:border-primary/50 hover:bg-muted/20 hover:shadow-md group-hover:scale-[1.02]'
          }
        `}
      >
        <div className="user-info flex items-center gap-3 flex-1 min-w-0">
          <Avatar className={`flex-shrink-0 transition-all duration-200 ${isSelected ? 'ring-2 ring-primary/30' : ''} ${mobile ? 'w-10 h-10' : 'w-9 h-9'}`}>
            <AvatarFallback className={`text-xs font-semibold ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
              {(user.first_name || '').charAt(0)}{(user.last_name || '').charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="user-details flex flex-col gap-1 min-w-0 flex-1">
            <span className={`user-name font-semibold truncate transition-colors ${isSelected ? 'text-primary' : 'text-foreground'} ${mobile ? 'text-sm' : 'text-sm'}`}>
              {user.first_name} {user.last_name}
            </span>
            <span className="user-role text-xs text-muted-foreground font-medium">
              {user.role === 'admin' ? 'Amministratore' : 
               user.role === 'socio' ? 'Socio' : 'Dipendente'}
            </span>
          </div>
        </div>
        
        <div className="user-status flex-shrink-0">
          <Badge
            variant={user.isRecommended ? 'default' : 'secondary'}
            className={`text-xs px-3 py-1 font-medium transition-all duration-200 ${
              user.isRecommended 
                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            } ${isSelected && user.isRecommended ? 'bg-green-200 ring-1 ring-green-300' : ''}`}
          >
            {user.displayStatus}
          </Badge>
        </div>
      </label>
    </div>
  );
}