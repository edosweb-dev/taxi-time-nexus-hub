
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
}

export function UserRoleField({ control }: UserRoleFieldProps) {
  const allRoles: { value: 'admin' | 'socio' | 'dipendente'; label: string }[] = [
    { value: 'admin', label: 'Amministratore' },
    { value: 'socio', label: 'Socio' },
    { value: 'dipendente', label: 'Dipendente' },
  ];

  return (
    <FormField
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ruolo</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value || 'admin'}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un ruolo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {allRoles.map(role => (
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
