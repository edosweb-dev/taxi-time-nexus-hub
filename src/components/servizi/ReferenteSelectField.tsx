
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
          <FormLabel className="flex items-center gap-2">
            Referente (opzionale)
            <span className="text-xs text-muted-foreground font-normal">
              - Se non specificato, i passeggeri saranno collegati all'azienda
            </span>
          </FormLabel>
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
              <SelectItem value="all">
                <div className="flex flex-col items-start">
                  <span>Tutti i referenti</span>
                  <span className="text-xs text-muted-foreground">Passeggeri collegati all'azienda</span>
                </div>
              </SelectItem>
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
