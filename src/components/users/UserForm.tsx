
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { UserFormData } from '@/lib/usersApi';
import { Profile, UserRole, Azienda } from '@/lib/types';
import { Save, X } from 'lucide-react';
import { UserMainInfoSection } from './form-sections/UserMainInfoSection';
import { UserContactInfoSection } from './form-sections/UserContactInfoSection';
import { UserAccountSection } from './form-sections/UserAccountSection';

interface UserFormProps {
  user?: Profile | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  defaultRole?: UserRole;
  hiddenRoles?: UserRole[];
  preselectedAzienda?: Azienda | null;
}

export function UserForm({ 
  user, 
  onSubmit, 
  onCancel, 
  isSubmitting, 
  defaultRole, 
  hiddenRoles,
  preselectedAzienda
}: UserFormProps) {
  const isEditing = !!user;

  // Form validation schema condizionale in base a isEditing
  const userFormSchema = z.object({
    first_name: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
    last_name: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri' }),
    email: isEditing 
      ? z.string().optional() // Email opzionale in modalità modifica
      : z.string().email({ message: 'Inserisci un indirizzo email valido' }), // Richiesta in modalità creazione
    telefono: z.string().optional().or(z.literal('')),
    role: z.enum(['admin', 'socio', 'dipendente', 'cliente'], {
      required_error: 'Seleziona un ruolo',
    }),
    password: isEditing 
      ? z.string().optional().or(z.literal('')) // In modifica, password opzionale
      : z.string()
          .min(8, { message: 'La password deve contenere almeno 8 caratteri' })
          .regex(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola' })
          .regex(/[0-9]/, { message: 'La password deve contenere almeno un numero' })
          .optional(), // Opzionale anche in creazione - se non fornita, sarà generata
    confirm_password: z.string().optional().or(z.literal('')),
  }).refine((data) => {
    if (data.password && data.confirm_password) {
      return data.password === data.confirm_password;
    }
    return true;
  }, {
    message: "Le password non corrispondono",
    path: ["confirm_password"],
  });

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.id ? '' : '', // Per utenti esistenti, il campo email è vuoto in modifica
      telefono: user?.telefono || '',
      role: user?.role || defaultRole || 'dipendente',
      password: '',
      confirm_password: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof userFormSchema>) => {
    console.log("Form values before submit:", values);
    
    if (isEditing) {
      const userData: Partial<UserFormData> = {};
      
      // Sempre includi il ruolo, anche se non è cambiato
      userData.role = values.role;
      
      console.log(`Updating role: ${user?.role} -> ${values.role}`);
      
      // Includi altre modifiche se vengono fornite
      if (values.first_name) {
        userData.first_name = values.first_name.trim();
      }
      
      if (values.last_name) {
        userData.last_name = values.last_name.trim();
      }
      
      if (values.telefono !== undefined) {
        userData.telefono = values.telefono.trim() || undefined;
      }
      
      if (values.password) {
        userData.password = values.password;
      }
      
      console.log("User data being submitted (edit mode):", userData);
      onSubmit(userData as UserFormData);
    } else {
      // Modalità creazione: includi tutti i campi
      const userData: UserFormData = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        role: values.role,
        email: values.email.trim(),
        telefono: values.telefono?.trim() || undefined,
      };

      // Aggiungi password solo se fornita
      if (values.password) {
        userData.password = values.password;
      }
      
      // Se c'è un'azienda preselezionata, aggiungi l'ID azienda
      if (preselectedAzienda) {
        userData.azienda_id = preselectedAzienda.id;
      }
      
      console.log("User data being submitted (create mode):", userData);
      onSubmit(userData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Main Information Section */}
        <UserMainInfoSection 
          control={form.control} 
          isEditing={isEditing} 
        />
        
        {/* Contact Information Section */}
        <UserContactInfoSection 
          control={form.control} 
          isEditing={isEditing} 
          userEmail={user?.email}
        />
        
        {/* Account Configuration Section */}
        <UserAccountSection 
          control={form.control} 
          isEditing={isEditing} 
          defaultRole={defaultRole}
          hiddenRoles={hiddenRoles}
        />

        {preselectedAzienda && (
          <div className="bg-muted/50 p-3 rounded-md border-l-4 border-l-primary">
            <p className="text-sm">
              <span className="font-medium">Azienda:</span> {preselectedAzienda.nome}
            </p>
          </div>
        )}

        {/* Action Buttons */}
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
            {isSubmitting ? 'Salvataggio...' : isEditing ? 'Aggiorna Utente' : 'Crea Utente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
