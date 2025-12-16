import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { UserFormData } from '@/lib/api/users/types';
import { Profile, UserRole, Azienda } from '@/lib/types';
import { Save, X } from 'lucide-react';
import { UserMainInfoSection } from './form-sections/UserMainInfoSection';
import { UserContactInfoSection } from './form-sections/UserContactInfoSection';
import { UserAccountSection } from './form-sections/UserAccountSection';
import { UserCompanySection } from './form-sections/UserCompanySection';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserFormProps {
  user?: Profile | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function UserForm({ 
  user, 
  onSubmit, 
  onCancel, 
  isSubmitting
}: UserFormProps) {
  const isEditing = !!user;
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const userFormSchema = z.object({
    first_name: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
    last_name: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri' }),
    email: isEditing 
      ? z.string().optional()
      : z.string().email({ message: 'Inserisci un indirizzo email valido' }),
    telefono: z.string().optional().or(z.literal('')),
    role: z.enum(['admin', 'socio', 'dipendente'], {
      required_error: 'Seleziona un ruolo',
    }),
    color: z.string().optional(),
    password: isEditing 
      ? z.string().optional().or(z.literal(''))
      : z.string()
          .min(8, { message: 'La password deve contenere almeno 8 caratteri' })
          .regex(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola' })
          .regex(/[0-9]/, { message: 'La password deve contenere almeno un numero' })
          .optional(),
  });

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.id ? '' : '',
      telefono: user?.telefono || '',
      role: user?.role as 'admin' | 'socio' | 'dipendente' || 'admin',
      color: user?.color || '',
      password: '',
    },
  });

  // Check if email exists before submitting
  const checkEmailExists = useCallback(async (email: string): Promise<boolean> => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    return !!data;
  }, []);

  const handleSubmit = async (values: z.infer<typeof userFormSchema>) => {
    // Check email existence for new users
    if (!isEditing && values.email) {
      setIsCheckingEmail(true);
      const emailExists = await checkEmailExists(values.email);
      setIsCheckingEmail(false);
      
      if (emailExists) {
        form.setError('email', {
          type: 'manual',
          message: 'Questa email è già registrata. Utilizza un indirizzo diverso.'
        });
        toast.error('Email già registrata', {
          description: 'Utilizza un indirizzo email diverso.'
        });
        return;
      }
    }

    if (isEditing) {
      const userData: Partial<UserFormData> = {};
      
      userData.role = values.role;
      
      if (values.first_name && values.first_name !== user?.first_name) {
        userData.first_name = values.first_name.trim();
      }
      
      if (values.last_name && values.last_name !== user?.last_name) {
        userData.last_name = values.last_name.trim();
      }
      
      if (values.telefono !== user?.telefono) {
        userData.telefono = values.telefono?.trim() || undefined;
      }
      
      if (values.color !== user?.color) {
        userData.color = values.color || null;
      }
      
      if (values.password) {
        userData.password = values.password;
      }
      
      onSubmit(userData as UserFormData);
    } else {
      const userData: UserFormData = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        role: values.role,
        email: values.email.trim(),
        telefono: values.telefono?.trim() || undefined,
        color: values.color || null,
      };

      if (values.password) {
        userData.password = values.password;
      }
      
      onSubmit(userData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <UserMainInfoSection 
          control={form.control} 
          isEditing={isEditing}
          userRole={form.watch('role') || user?.role}
        />
        
        <UserContactInfoSection 
          control={form.control} 
          isEditing={isEditing} 
          userEmail={user?.email}
        />
        
        <UserAccountSection 
          control={form.control} 
          isEditing={isEditing}
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isCheckingEmail}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isCheckingEmail ? 'Verifica email...' : isSubmitting ? 'Salvataggio...' : isEditing ? 'Aggiorna Utente' : 'Crea Utente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
