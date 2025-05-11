
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";

interface PasseggeroFieldsProps {
  index: number;
}

export function PasseggeroFields({ index }: PasseggeroFieldsProps) {
  const { control } = useFormContext();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`passeggeri.${index}.nome_cognome`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome e cognome *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Mario Rossi" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`passeggeri.${index}.orario_presa`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orario di presa *</FormLabel>
              <FormControl>
                <Input {...field} type="time" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`passeggeri.${index}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="email@esempio.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`passeggeri.${index}.telefono`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefono</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+39 123 456 7890" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name={`passeggeri.${index}.usa_indirizzo_personalizzato`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                Usa indirizzo personalizzato
              </FormLabel>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`passeggeri.${index}.luogo_presa`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Luogo di presa *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Via Roma, 1, Milano" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`passeggeri.${index}.destinazione`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destinazione *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Aeroporto Malpensa, Milano" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
