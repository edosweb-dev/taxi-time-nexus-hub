import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MobileInput } from "@/components/ui/mobile-input";
import { MobileTextarea } from "@/components/ui/mobile-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServizioFormData } from "@/lib/types/servizi";
import { AziendaSelectField } from "./AziendaSelectField";
import { ReferenteSelectField } from "./ReferenteSelectField";
import { VeicoloSelectField } from "@/components/veicoli/VeicoloSelectField";
import { useImpostazioni } from "@/hooks/useImpostazioni";
import { useAuth } from "@/contexts/AuthContext";
import { ProvvigioneServizioField } from "./ProvvigioneServizioField";
import { NotificheEmailField } from "./NotificheEmailField";
import { PercorsoSection } from "./PercorsoSection";

export function ServizioDetailsForm() {
  const { control } = useFormContext<ServizioFormData>();
  const { impostazioni } = useImpostazioni();
  const { profile } = useAuth();
  
  // Watch azienda_id per abilitare/disabilitare il campo referente
  const azienda_id = useWatch({ control, name: "azienda_id" });

  const metodiPagamento = impostazioni?.metodi_pagamento || [];
  
  // Check if user can edit ore fields (only admin or socio)
  const canEditOreFields = profile?.role === 'admin' || profile?.role === 'socio';

  return (
    <div className="space-y-6">
        {/* Section: Company & Contact */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Azienda e contatto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AziendaSelectField />
            <ReferenteSelectField aziendaId={azienda_id || ""} />
          </div>
        </div>

        {/* Section: Schedule */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Data e orario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <FormField
              control={control}
              name="data_servizio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data servizio *</FormLabel>
                  <FormControl>
                    <MobileInput 
                      type="date" 
                      {...field}
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
                    <MobileInput 
                      type="time" 
                      {...field}
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
                    <MobileInput 
                      placeholder="ES-2024-001"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Pickup Location */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Punto di partenza</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name="citta_presa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città (Presa)</FormLabel>
                  <FormControl>
                    <MobileInput 
                      placeholder="Milano"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="indirizzo_presa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indirizzo di presa *</FormLabel>
                  <FormControl>
                    <MobileInput 
                      placeholder="Via Roma 123"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Destination */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Destinazione</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={control}
              name="citta_destinazione"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Città (Destinazione)</FormLabel>
                  <FormControl>
                    <MobileInput 
                      placeholder="Ferno"
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
                    <MobileInput 
                      placeholder="Aeroporto di Malpensa"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Service Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Dettagli operativi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FormField
              control={control}
              name="metodo_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metodo di pagamento *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona metodo" />
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

            {/* Campi ore RIMOSSI: ore vengono inserite solo in consuntivazione */}
            
            <VeicoloSelectField />
          </div>
        </div>

        {/* Section: Commission */}
        <ProvvigioneServizioField />

        {/* Section: Email Notifications */}
        <NotificheEmailField />

        {/* Section: Notes */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Note aggiuntive</h3>
          <FormField
            control={control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <MobileTextarea 
                    placeholder="Eventuali note aggiuntive..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
    </div>
  );
}