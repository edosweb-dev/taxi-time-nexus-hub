
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole } from '@/lib/types';

interface UserRoleFilterProps {
  selectedRole: UserRole | 'all';
  onRoleChange: (role: UserRole | 'all') => void;
  availableRoles?: UserRole[];
}

export function UserRoleFilter({ 
  selectedRole, 
  onRoleChange, 
  availableRoles = ['admin', 'socio', 'dipendente'] 
}: UserRoleFilterProps) {
  const getRoleName = (role: UserRole | 'all') => {
    switch (role) {
      case 'admin':
        return 'Amministratore';
      case 'socio':
        return 'Socio';
      case 'dipendente':
        return 'Dipendente';
      case 'all':
        return 'Tutti i ruoli';
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Filtra per ruolo:</span>
      <Select value={selectedRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Seleziona ruolo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tutti i ruoli</SelectItem>
          {availableRoles.map(role => (
            <SelectItem key={role} value={role}>
              {getRoleName(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
