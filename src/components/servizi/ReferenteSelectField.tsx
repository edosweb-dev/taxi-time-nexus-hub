
import { useQuery } from '@tanstack/react-query';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useFormContext } from 'react-hook-form';

interface ReferenteSelectFieldProps {
  aziendaId: string;
  onValueChange?: (value: string) => void;
}

export function ReferenteSelectField({ aziendaId, onValueChange }: ReferenteSelectFieldProps) {
  const form = useFormContext();

  const { data: referenti = [], isLoading } = useQuery({
    queryKey: ['referenti', aziendaId],
    queryFn: async () => {
      if (!aziendaId) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('azienda_id', aziendaId)
        .eq('role', 'cliente');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!aziendaId,
  });

  return (
    <FormField
      control={form.control}
      name="referente_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Referente (opzionale)</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value === 'all' ? '' : value);
              onValueChange?.(value === 'all' ? '' : value);
            }} 
            value={field.value || 'all'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoading 
                    ? "Caricamento..." 
                    : referenti.length === 0 
                      ? "Nessun referente disponibile"
                      : "Seleziona un referente (opzionale)"
                } />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="all">Tutti i referenti</SelectItem>
              {referenti.map((referente) => (
                <SelectItem key={referente.id} value={referente.id}>
                  {referente.first_name} {referente.last_name}
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
