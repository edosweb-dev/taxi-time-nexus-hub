
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface UserPasswordFieldsProps {
  control: Control<any>;
  isEditing: boolean;
}

export function UserPasswordFields({ control, isEditing }: UserPasswordFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isEditing ? 'Nuova Password (lasciare vuoto per non modificare)' : 'Password'}</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Inserisci la password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="confirm_password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Conferma Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Conferma la password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
