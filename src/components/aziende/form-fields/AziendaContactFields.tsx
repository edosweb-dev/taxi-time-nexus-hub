
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { MultiContactFields } from "./MultiContactFields";

interface AziendaContactFieldsProps {
  control: Control<any>;
}

export function AziendaContactFields({ control }: AziendaContactFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Prima riga: Email principale | Telefono principale */}
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Principale</FormLabel>
              <FormControl>
                <Input placeholder="Email aziendale" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefono Principale</FormLabel>
              <FormControl>
                <Input placeholder="Numero di telefono" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Seconda riga: Indirizzi email | Numeri di telefono */}
      <MultiContactFields control={control} />
    </div>
  );
}
