
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface UserEmailFieldProps {
  control: Control<any>;
  isEditing?: boolean;
  userEmail?: string; // Email dell'utente quando in modalità modifica
}

export function UserEmailField({ control, isEditing = false, userEmail }: UserEmailFieldProps) {
  // Se stiamo modificando un utente esistente, mostriamo l'email in sola lettura
  if (isEditing && userEmail) {
    return (
      <div className="space-y-2">
        <FormLabel>Email</FormLabel>
        <Input
          value={userEmail}
          disabled
          className="bg-muted"
          placeholder="Email non disponibile"
        />
        <p className="text-xs text-muted-foreground">
          L'email non può essere modificata una volta creato l'account
        </p>
      </div>
    );
  }

  // Altrimenti mostriamo il campo normale per la creazione
  return (
    <FormField
      control={control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email *</FormLabel>
          <FormControl>
            <Input 
              type="email" 
              placeholder="email@esempio.com" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
