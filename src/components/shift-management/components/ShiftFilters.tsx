import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/useUsers';

interface ShiftFiltersProps {
  selectedUsers: string[];
  onUsersChange: (users: string[]) => void;
  isAdminOrSocio: boolean;
}

export function ShiftFilters({ selectedUsers, onUsersChange, isAdminOrSocio }: ShiftFiltersProps) {
  const { users } = useUsers();
  
  // Filtra solo dipendenti/admin/soci per i turni
  const workingUsers = users.filter(user => 
    user.role === 'admin' || user.role === 'socio' || user.role === 'dipendente'
  );

  const handleUserChange = (value: string) => {
    if (value === 'all') {
      onUsersChange([]);
    } else {
      onUsersChange([value]);
    }
  };

  const selectedUserId = selectedUsers.length === 1 ? selectedUsers[0] : 'all';

  if (!isAdminOrSocio) {
    return null; // I dipendenti vedono solo i propri turni
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Filtra per utente</Label>
        
        <Select value={selectedUserId} onValueChange={handleUserChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona utente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli utenti</SelectItem>
            {workingUsers.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: user.color || '#6B7280' }}
                  />
                  {user.first_name} {user.last_name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}