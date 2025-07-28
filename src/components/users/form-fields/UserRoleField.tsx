
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { UserRole } from '@/lib/types';

interface UserRoleFieldProps {
  control: Control<any>;
  hiddenRoles?: UserRole[];
  defaultRole?: UserRole;
}

export function UserRoleField({ control, hiddenRoles = [], defaultRole }: UserRoleFieldProps) {
  // Definisci tutte le possibili opzioni di ruolo
  const allRoles: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Amministratore' },
    { value: 'socio', label: 'Socio' },
    { value: 'dipendente', label: 'Dipendente' },
  ];

  // Filtra i ruoli nascosti
  const visibleRoles = allRoles.filter(role => !hiddenRoles.includes(role.value));

  return (
    <FormField
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ruolo</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value || defaultRole || 'cliente'}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un ruolo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {visibleRoles.map(role => (
                <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
