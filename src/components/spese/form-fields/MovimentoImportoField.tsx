
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MovimentoFormValues } from "../schemas/movimentoFormSchema";

interface MovimentoImportoFieldProps {
  form: UseFormReturn<MovimentoFormValues>;
}

export function MovimentoImportoField({ form }: MovimentoImportoFieldProps) {
  return (
    <FormField
      control={form.control}
      name="importo"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Importo (€)</FormLabel>
          <FormControl>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
