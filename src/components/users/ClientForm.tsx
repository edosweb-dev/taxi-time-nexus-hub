import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { UserFormData } from '@/lib/api/users/types';
import { Profile, Azienda } from '@/lib/types';
import { Save, X } from 'lucide-react';
import { UserMainInfoSection } from './form-sections/UserMainInfoSection';
import { UserContactInfoSection } from './form-sections/UserContactInfoSection';
import { UserCompanySection } from './form-sections/UserCompanySection';

interface ClientFormProps {
  user?: Profile | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  preselectedAzienda?: Azienda | null;
}

export function ClientForm({ 
  user, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  preselectedAzienda
}: ClientFormProps) {
  const isEditing = !!user;

  const clientFormSchema = z.object({
    first_name: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
    last_name: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri' }),
    email: isEditing 
      ? z.string().optional()
      : z.string().email({ message: 'Inserisci un indirizzo email valido' }),
    telefono: z.string().optional().or(z.literal('')),
    azienda_id: z.string().min(1, { message: "Seleziona un'azienda" }),
    password: isEditing 
      ? z.string().optional().or(z.literal(''))
      : z.string()
          .min(8, { message: 'La password deve contenere almeno 8 caratteri' })
          .regex(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola' })
          .regex(/[0-9]/, { message: 'La password deve contenere almeno un numero' })
          .optional(),
  });

  const form = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.id ? '' : '',
      telefono: user?.telefono || '',
      azienda_id: user?.azienda_id || preselectedAzienda?.id || '',
      password: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof clientFormSchema>) => {
    if (isEditing) {
      const userData: Partial<UserFormData> = {
        role: 'cliente',
      };
      
      if (values.first_name && values.first_name !== user?.first_name) {
        userData.first_name = values.first_name.trim();
      }
      
      if (values.last_name && values.last_name !== user?.last_name) {
        userData.last_name = values.last_name.trim();
      }
      
      if (values.telefono !== user?.telefono) {
        userData.telefono = values.telefono?.trim() || undefined;
      }
      
      if (values.azienda_id !== user?.azienda_id) {
        userData.azienda_id = values.azienda_id;
      }
      
      if (values.password) {
        userData.password = values.password;
      }
      
      onSubmit(userData as UserFormData);
    } else {
      const userData: UserFormData = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        role: 'cliente',
        email: values.email.trim(),
        telefono: values.telefono?.trim() || undefined,
        azienda_id: preselectedAzienda?.id || values.azienda_id,
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
          userRole="cliente"
        />
        
        <UserContactInfoSection 
          control={form.control} 
          isEditing={isEditing} 
          userEmail={user?.email}
        />

        {!preselectedAzienda && (
          <UserCompanySection control={form.control} required={true} />
        )}

        {preselectedAzienda && (
          <div className="bg-muted/50 p-3 rounded-md border-l-4 border-l-primary">
            <p className="text-sm">
              <span className="font-medium">Azienda:</span> {preselectedAzienda.nome}
            </p>
          </div>
        )}

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
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Salvataggio...' : isEditing ? 'Aggiorna Cliente' : 'Crea Cliente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
