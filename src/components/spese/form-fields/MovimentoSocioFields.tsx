
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { MovimentoFormValues } from "../schemas/movimentoFormSchema";
import { Profile } from "@/lib/types";

interface MovimentoSocioFieldsProps {
  form: UseFormReturn<MovimentoFormValues>;
  soci: Profile[];
  isLoadingUsers: boolean;
}

export function MovimentoSocioFields({ form, soci, isLoadingUsers }: MovimentoSocioFieldsProps) {
  const è_effettuato_da_socio = useWatch({
    control: form.control,
    name: "è_effettuato_da_socio",
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="è_effettuato_da_socio"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Effettuato da un socio</FormLabel>
              <FormDescription>
                Indica se questo movimento è stato effettuato da un socio
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {è_effettuato_da_socio && (
        <FormField
          control={form.control}
          name="effettuato_da_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seleziona socio</FormLabel>
              {isLoadingUsers ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Caricamento soci...</span>
                </div>
              ) : (
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un socio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {soci.map((socio) => (
                      <SelectItem key={socio.id} value={socio.id}>
                        {socio.first_name} {socio.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
