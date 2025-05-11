
import React from "react";
import { useFormContext } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServizioFormData } from "@/lib/types/servizi";
import { useAuth } from "@/hooks/useAuth";
import { AziendaSelectField } from "./AziendaSelectField";

export function ServizioDetailsForm() {
  const { control } = useFormContext<ServizioFormData>();
  const { profile } = useAuth();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Azienda Select Field */}
          {profile?.role === "cliente" && profile?.azienda_id ? (
            <FormField
              control={control}
              name="azienda_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Azienda</FormLabel>
                  <FormControl>
                    <Input value="La tua azienda" disabled />
                  </FormControl>
                </FormItem>
              )}
            />
          ) : (
            <AziendaSelectField />
          )}

          {/* Numero Commessa */}
          <FormField
            control={control}
            name="numero_commessa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero Commessa</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="ABC123" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Data del servizio */}
          <FormField
            control={control}
            name="data_servizio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data del servizio *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Metodo di pagamento */}
          <FormField
            control={control}
            name="metodo_pagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metodo di pagamento *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un metodo di pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Contanti">Contanti</SelectItem>
                    <SelectItem value="Carta">Carta</SelectItem>
                    <SelectItem value="Bonifico">Bonifico</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Note */}
        <div className="mt-4">
          <FormField
            control={control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note aggiuntive</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Inserisci eventuali note o informazioni aggiuntive"
                    className="min-h-[100px] resize-y"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
