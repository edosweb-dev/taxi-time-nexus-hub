import React, { useState, useEffect, useCallback } from 'react';
import { Control, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserEmailFieldProps {
  control: Control<any>;
  isEditing?: boolean;
  userEmail?: string;
}

export function UserEmailField({ control, isEditing = false, userEmail }: UserEmailFieldProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  
  const watchedEmail = useWatch({ control, name: 'email' });

  // Debounced email check
  const checkEmailExists = useCallback(async (email: string) => {
    if (!email || email.length < 5 || !email.includes('@')) {
      setEmailExists(false);
      setHasChecked(false);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error) {
        console.error('Error checking email:', error);
        setEmailExists(false);
      } else {
        setEmailExists(!!data);
      }
      setHasChecked(true);
    } catch (err) {
      console.error('Error checking email:', err);
      setEmailExists(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Debounce the email check
  useEffect(() => {
    if (isEditing) return;
    
    const timeoutId = setTimeout(() => {
      if (watchedEmail) {
        checkEmailExists(watchedEmail);
      } else {
        setEmailExists(false);
        setHasChecked(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedEmail, checkEmailExists, isEditing]);

  // Se stiamo modificando un utente esistente, mostriamo l'email in sola lettura
  if (isEditing) {
    return (
      <div className="space-y-2">
        <FormLabel>Email</FormLabel>
        <Input
          value={userEmail || 'Email non disponibile'}
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
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>Email *</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                type="email" 
                placeholder="email@esempio.com" 
                {...field}
                className={cn(
                  emailExists && "border-destructive focus-visible:ring-destructive",
                  hasChecked && !emailExists && watchedEmail && "border-green-500 focus-visible:ring-green-500"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isChecking && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!isChecking && emailExists && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                {!isChecking && hasChecked && !emailExists && watchedEmail && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </FormControl>
          {emailExists && (
            <p className="text-sm font-medium text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Questa email è già registrata. Utilizza un indirizzo diverso.
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
