
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MovimentoFormValues } from "../schemas/movimentoFormSchema";

interface MovimentoNoteFieldProps {
  form: UseFormReturn<MovimentoFormValues>;
}

export function MovimentoNoteField({ form }: MovimentoNoteFieldProps) {
  return (
    <FormField
      control={form.control}
      name="note"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Note (opzionale)</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Note aggiuntive sul movimento"
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
