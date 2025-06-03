
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsers } from '@/hooks/useUsers';
import { getInitials, getRuoloBadge } from '../TabellaStipendi/utils';
import { ServiziUtilityButtons } from '../ServiziUtilityButtons';
import { SectionProps } from './types';

interface UserSelectionSectionProps extends SectionProps {
  onKmCalculated: (km: number) => void;
  onOreCalculated: (ore: number) => void;
}

export function UserSelectionSection({
  form,
  selectedUser,
  selectedMonth,
  selectedYear,
  isLoading,
  onKmCalculated,
  onOreCalculated,
}: UserSelectionSectionProps) {
  const { users } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });

  // Group users by role
  const groupedUsers = users.reduce((groups, user) => {
    const role = user.role === 'socio' ? 'soci' : user.role === 'admin' ? 'admin' : 'dipendenti';
    if (!groups[role]) groups[role] = [];
    groups[role].push(user);
    return groups;
  }, {} as { soci?: any[]; dipendenti?: any[]; admin?: any[] });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Seleziona Utente</h3>
      <FormField
        control={form.control}
        name="user_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Dipendente/Socio *</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un utente..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {groupedUsers.admin && groupedUsers.admin.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      AMMINISTRATORI
                    </div>
                    {groupedUsers.admin.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.first_name} {user.last_name}</span>
                          {getRuoloBadge(user.role)}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                {groupedUsers.soci && groupedUsers.soci.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      SOCI
                    </div>
                    {groupedUsers.soci.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.first_name} {user.last_name}</span>
                          {getRuoloBadge(user.role)}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                {groupedUsers.dipendenti && groupedUsers.dipendenti.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      DIPENDENTI
                    </div>
                    {groupedUsers.dipendenti.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.first_name} {user.last_name}</span>
                          {getRuoloBadge(user.role)}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedUser && (
        <ServiziUtilityButtons 
          userId={selectedUser.id}
          mese={selectedMonth}
          anno={selectedYear}
          onKmCalculated={onKmCalculated}
          onOreCalculated={onOreCalculated}
          size="sm"
        />
      )}
    </div>
  );
}
