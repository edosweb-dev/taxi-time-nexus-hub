
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext, useWatch } from "react-hook-form";
import { Clock, MapPin } from "lucide-react";

interface PasseggeroFieldsProps {
  index: number;
}

export function PasseggeroFields({ index }: PasseggeroFieldsProps) {
  const { control } = useFormContext();
  
  // Watch the usa_indirizzo_personalizzato field to conditionally render fields
  const usaIndirizzoPersonalizzato = useWatch({
    control,
    name: `passeggeri.${index}.usa_indirizzo_personalizzato`
  });

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
        
        {usaIndirizzoPersonalizzato && (
          <FormField
            control={control}
            name={`passeggeri.${index}.orario_presa_personalizzato`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orario di presa personalizzato *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input {...field} type="time" className="pl-8" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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

      <FormField
        control={control}
        name={`passeggeri.${index}.telefono_2`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefono 2 (opzionale)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="+39 123 456 7890" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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

        {usaIndirizzoPersonalizzato && (
          <>
            <FormField
              control={control}
              name={`passeggeri.${index}.luogo_presa_personalizzato`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Luogo di presa personalizzato *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} placeholder="Via Roma, 1, Milano" className="pl-8" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`passeggeri.${index}.destinazione_personalizzato`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinazione personalizzata *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} placeholder="Aeroporto Malpensa, Milano" className="pl-8" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </>
  );
}
