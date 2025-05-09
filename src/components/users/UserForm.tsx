import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserFormData } from '@/lib/usersApi';
import { Profile } from '@/lib/types';

// Form validation schema
const userFormSchema = z.object({
  first_name: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
  last_name: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri' }),
  email: z.string().email({ message: 'Inserisci un indirizzo email valido' }),
  role: z.enum(['admin', 'socio', 'dipendente', 'cliente'], {
    required_error: 'Seleziona un ruolo',
  }),
  password: z.string()
    .min(8, { message: 'La password deve contenere almeno 8 caratteri' })
    .regex(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola' })
    .regex(/[0-9]/, { message: 'La password deve contenere almeno un numero' })
    .optional()
    .or(z.literal('')),
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

interface UserFormProps {
  user?: Profile | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function UserForm({ user, onSubmit, onCancel, isSubmitting }: UserFormProps) {
  const isEditing = !!user;

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: isEditing ? '' : '', // Per utenti esistenti, il campo email è vuoto in modifica
      role: user?.role || 'dipendente', // Default a 'dipendente' invece di 'cliente'
      password: '',
      confirm_password: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof userFormSchema>) => {
    console.log("Form values before submit:", values);
    console.log("First name:", values.first_name);
    console.log("Last name:", values.last_name);
    console.log("Role selected:", values.role);
    
    // Completo il userData con tutti i campi richiesti
    const userData: UserFormData = {
      first_name: values.first_name,
      last_name: values.last_name,
      role: values.role,
      email: values.email, // Includo email per tutti i casi
    };

    // Aggiungo password solo se fornita
    if (values.password) {
      userData.password = values.password;
    }
    
    console.log("User data being submitted:", userData);
    onSubmit(userData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Inserisci il nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cognome</FormLabel>
                <FormControl>
                  <Input placeholder="Inserisci il cognome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ruolo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un ruolo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Amministratore</SelectItem>
                  <SelectItem value="socio">Socio</SelectItem>
                  <SelectItem value="dipendente">Dipendente</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
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
          control={form.control}
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

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvataggio in corso...' : isEditing ? 'Aggiorna Utente' : 'Crea Utente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
