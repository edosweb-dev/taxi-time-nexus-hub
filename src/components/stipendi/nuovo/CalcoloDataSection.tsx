
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SectionProps } from './types';

export function CalcoloDataSection({
  form,
  selectedUser,
  isLoading,
}: SectionProps) {
  if (!selectedUser) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Dati Calcolo</h3>
      
      {selectedUser.role === 'socio' && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="km"
            render={({ field }) => (
              <FormItem>
                <FormLabel>KM *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={12}
                    step={5}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ore_attesa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ore Attesa</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {(selectedUser.role === 'dipendente' || selectedUser.role === 'admin') && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ore_lavorate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ore Lavorate *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tariffa_oraria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tariffa Oraria €</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
