import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control } from 'react-hook-form';

interface MobileInfoFieldsProps {
  control: Control<any>;
}

export function MobileInfoFields({ control }: MobileInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Azienda *</FormLabel>
            <FormControl>
              <Input 
                placeholder="Nome dell'azienda" 
                {...field}
                autoComplete="organization"
                className="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="partita_iva"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Partita IVA *</FormLabel>
            <FormControl>
              <Input 
                placeholder="11 cifre numeriche"
                {...field}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                autoComplete="off"
                className="text-base"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Deve essere di 11 cifre numeriche
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="indirizzo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Indirizzo</FormLabel>
            <FormControl>
              <Input 
                placeholder="Indirizzo completo" 
                {...field} 
                value={field.value || ''}
                autoComplete="street-address"
                className="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="citta"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Città</FormLabel>
            <FormControl>
              <Input 
                placeholder="Città" 
                {...field} 
                value={field.value || ''}
                autoComplete="address-level2"
                className="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="sdi"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Codice SDI</FormLabel>
            <FormControl>
              <Input 
                placeholder="Codice SDI" 
                {...field} 
                value={field.value || ''}
                autoComplete="off"
                className="text-base"
              />
            </FormControl>
            <FormDescription className="text-xs">
              Sistema di Interscambio per fatturazione elettronica
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="pec"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PEC</FormLabel>
            <FormControl>
              <Input 
                placeholder="pec@esempio.it" 
                {...field} 
                value={field.value || ''}
                type="email"
                autoComplete="email"
                className="text-base"
              />
            </FormControl>
            <FormDescription className="text-xs">
              Posta Elettronica Certificata
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
