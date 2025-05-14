
import React from "react";
import { useFormContext } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function AziendaInfoForm() {
  const { control } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="nome_azienda"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Azienda</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nome dell'azienda" />
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
                {...field} 
                placeholder="Partita IVA" 
                value={field.value || ""} 
                onChange={(e) => field.onChange(e.target.value || null)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="indirizzo_sede"
        render={({ field }) => (
          <FormItem className="col-span-1 md:col-span-2">
            <FormLabel>Indirizzo Sede</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="Via, numero, città, CAP" 
                value={field.value || ""} 
                onChange={(e) => field.onChange(e.target.value || null)} 
              />
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
            <FormLabel>Telefono</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="Telefono" 
                value={field.value || ""} 
                onChange={(e) => field.onChange(e.target.value || null)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                type="email" 
                placeholder="Email" 
                value={field.value || ""} 
                onChange={(e) => field.onChange(e.target.value || null)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
