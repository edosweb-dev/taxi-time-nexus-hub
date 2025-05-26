
import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { ServizioFormData } from "@/lib/types/servizi";
import { AziendaSelectField } from "./AziendaSelectField";
import { ReferenteSelectField } from "./ReferenteSelectField";
import { VeicoloSelectField } from "@/components/veicoli/VeicoloSelectField";
import { useImpostazioni } from "@/hooks/useImpostazioni";

export function ServizioDetailsForm() {
  const { control } = useFormContext<ServizioFormData>();
  const { impostazioni } = useImpostazioni();
  
  // Watch azienda_id per abilitare/disabilitare il campo referente
  const azienda_id = useWatch({ control, name: "azienda_id" });

  const metodiPagamento = impostazioni?.metodi_pagamento || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dettagli del Servizio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Azienda e Referente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AziendaSelectField />
          <ReferenteSelectField aziendaId={azienda_id || ""} />
        </div>

        {/* Data e orario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="data_servizio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data servizio *</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="orario_servizio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orario servizio *</FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="numero_commessa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero commessa</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="ES-2024-001"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Indirizzi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="indirizzo_presa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indirizzo di presa *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Via Roma 123, Milano"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="indirizzo_destinazione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indirizzo di destinazione *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Aeroporto di Malpensa, Ferno"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Metodo pagamento e veicolo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="metodo_pagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metodo di pagamento *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona metodo di pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {metodiPagamento.map((metodo) => (
                      <SelectItem key={metodo.id} value={metodo.nome}>
                        {metodo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <VeicoloSelectField />
        </div>

        {/* Note */}
        <FormField
          control={control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Eventuali note aggiuntive..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
