
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { useVeicoliAttivi } from '@/hooks/useVeicoli';
import { Skeleton } from '@/components/ui/skeleton';

export function VeicoloSelectField() {
  const { control } = useFormContext();
  const { veicoli, isLoading } = useVeicoliAttivi();

  return (
    <FormField
      control={control}
      name="veicolo_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Veicolo</FormLabel>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select 
              value={field.value || 'none'} 
              onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un veicolo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Nessun veicolo</SelectItem>
                {veicoli.map((veicolo) => (
                  <SelectItem key={veicolo.id} value={veicolo.id}>
                    {veicolo.modello} - {veicolo.targa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
