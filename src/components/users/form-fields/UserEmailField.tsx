
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

interface UserEmailFieldProps {
  control: Control<any>;
  isEditing: boolean;
}

export function UserEmailField({ control, isEditing }: UserEmailFieldProps) {
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input 
              type="email" 
              placeholder="Inserisci l'email" 
              {...field} 
              disabled={isEditing}
            />
          </FormControl>
          {!isEditing && <FormMessage />}
        </FormItem>
      )}
    />
  );
}
