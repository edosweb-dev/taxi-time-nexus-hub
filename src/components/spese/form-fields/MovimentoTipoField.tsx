
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { MovimentoFormValues } from "../schemas/movimentoFormSchema";

interface MovimentoTipoFieldProps {
  form: UseFormReturn<MovimentoFormValues>;
}

export function MovimentoTipoField({ form }: MovimentoTipoFieldProps) {
  return (
    <FormField
      control={form.control}
      name="tipo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo di movimento</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="spesa">Spesa</SelectItem>
              <SelectItem value="incasso">Incasso</SelectItem>
              <SelectItem value="prelievo">Prelievo</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
