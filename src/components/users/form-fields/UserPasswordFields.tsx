
import React, { useState } from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Shuffle } from 'lucide-react';
import { Control } from 'react-hook-form';

interface UserPasswordFieldsProps {
  control: Control<any>;
  isEditing: boolean;
}

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export function UserPasswordFields({ control, isEditing }: UserPasswordFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isEditing ? 'Nuova Password (lasciare vuoto per non modificare)' : 'Password (opzionale)'}
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder={isEditing ? "Inserisci la nuova password" : "Inserisci la password o lascia vuoto"} 
                  {...field} 
                  className="pr-20"
                />
                <div className="absolute right-0 top-0 h-full flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-2 py-2 hover:bg-transparent"
                    onClick={() => {
                      const newPassword = generateRandomPassword();
                      field.onChange(newPassword);
                    }}
                    title="Genera password casuale"
                  >
                    <Shuffle className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-2 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </FormControl>
            {!isEditing && (
              <FormDescription>
                Se non inserisci una password, ne verrà generata una temporanea
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

    </>
  );
}
