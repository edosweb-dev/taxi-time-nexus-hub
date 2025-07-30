
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Control } from 'react-hook-form';
import { ShiftFormValues } from '../dialogs/ShiftFormSchema';

interface ShiftUserSelectProps {
  control: Control<ShiftFormValues>;
  isAdminOrSocio: boolean;
  isEditing: boolean;
}

interface User {
  id: string; 
  first_name: string | null; 
  last_name: string | null;
}

export function ShiftUserSelect({ control, isAdminOrSocio, isEditing }: ShiftUserSelectProps) {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  
  // Fetch users if admin or socio
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('ShiftUserSelect: Fetching users, isAdminOrSocio:', isAdminOrSocio);
        if (isAdminOrSocio) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, role')
            .in('role', ['admin', 'socio', 'dipendente'])
            .order('first_name');

          if (error) {
            console.error('ShiftUserSelect: Error fetching users:', error);
            throw error;
          }
          
          console.log('ShiftUserSelect: Fetched users:', data);
          setUsers(data || []);
        } else {
          console.log('ShiftUserSelect: Not admin/socio, clearing users');
          setUsers([]);
        }
      } catch (error) {
        console.error('ShiftUserSelect: Error in fetchUsers:', error);
        toast.error('Errore nel caricamento degli utenti');
      }
    };

    fetchUsers();
  }, [isAdminOrSocio]);
  
  if (!isAdminOrSocio) {
    return null;
  }
  
  return (
    <FormField
      control={control}
      name="user_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Utente</FormLabel>
          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={isEditing && !isAdminOrSocio}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un utente" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
