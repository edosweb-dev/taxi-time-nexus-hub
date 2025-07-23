
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
      {/* Campi singoli legacy per compatibilità */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Principale (Legacy)</FormLabel>
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
              <FormLabel>Telefono Principale (Legacy)</FormLabel>
              <FormControl>
                <Input placeholder="Numero di telefono" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Nuovi campi multipli */}
      <MultiContactFields control={control} />
      
      <FormField
        control={control}
        name="indirizzo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Indirizzo</FormLabel>
            <FormControl>
              <Input placeholder="Indirizzo completo" {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
