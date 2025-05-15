
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MovimentoFormValues } from "../schemas/movimentoFormSchema";

interface MovimentoCausaleFieldProps {
  form: UseFormReturn<MovimentoFormValues>;
}

export function MovimentoCausaleField({ form }: MovimentoCausaleFieldProps) {
  return (
    <FormField
      control={form.control}
      name="causale"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Causale</FormLabel>
          <FormControl>
            <Input placeholder="Causale del movimento" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
