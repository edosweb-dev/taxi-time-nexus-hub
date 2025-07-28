
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface AziendaNameFieldsProps {
  control: Control<any>;
}

export function AziendaNameFields({ control }: AziendaNameFieldsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <FormField
        control={control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Azienda</FormLabel>
            <FormControl>
              <Input placeholder="Inserisci il nome dell'azienda" {...field} />
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
            <FormLabel>Partita IVA</FormLabel>
            <FormControl>
              <Input 
                placeholder="11 cifre numeriche" 
                {...field} 
                maxLength={11}
                onChange={(e) => {
                  // Allow only numbers
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>
              Deve essere di 11 cifre numeriche
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
