
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServizioFormData } from "@/lib/types/servizi";
import { useAuth } from "@/hooks/useAuth";
import { AziendaSelectField } from "./AziendaSelectField";
import { ReferenteSelectField } from "./ReferenteSelectField";
import { VeicoloSelectField } from "@/components/veicoli/VeicoloSelectField";
import { MapPin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getImpostazioni } from "@/lib/api/impostazioni/getImpostazioni";
import { Skeleton } from "@/components/ui/skeleton";

export function ServizioDetailsForm() {
  const { control, watch, setValue } = useFormContext<ServizioFormData>();
  const { profile } = useAuth();
  const aziendaId = watch('azienda_id');
  
  // Carica le impostazioni per ottenere i metodi di pagamento
  const { data: impostazioni, isLoading: isLoadingImpostazioni } = useQuery({
    queryKey: ['impostazioni'],
    queryFn: getImpostazioni,
  });

  // Se i metodi di pagamento sono cambiati e il valore attuale non è più valido, imposta il primo valore disponibile
  useEffect(() => {
    if (impostazioni?.metodi_pagamento?.length > 0) {
      const metodo = watch('metodo_pagamento');
      const metodiDisponibili = impostazioni.metodi_pagamento.map(m => m.nome);
      
      if (metodo && !metodiDisponibili.includes(metodo)) {
        setValue('metodo_pagamento', metodiDisponibili[0]);
      } else if (!metodo) {
        setValue('metodo_pagamento', metodiDisponibili[0]);
      }
    }
  }, [impostazioni, setValue, watch]);
  
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

          {/* Referente Select Field */}
          <ReferenteSelectField aziendaId={aziendaId} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          
          {/* Metodo di pagamento */}
          <FormField
            control={control}
            name="metodo_pagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metodo di pagamento *</FormLabel>
                {isLoadingImpostazioni ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
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
                      {impostazioni?.metodi_pagamento && impostazioni.metodi_pagamento.length > 0 ? (
                        impostazioni.metodi_pagamento.map((metodo) => (
                          <SelectItem key={metodo.id} value={metodo.nome}>
                            {metodo.nome}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="nessuno">
                          Nessun metodo di pagamento disponibile
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

          {/* Orario del servizio */}
          <FormField
            control={control}
            name="orario_servizio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orario del servizio *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="time" {...field} className="pl-8" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Veicolo */}
          <VeicoloSelectField />
        </div>

        <div className="mb-6">
          {/* Indirizzo di presa generale */}
          <FormField
            control={control}
            name="indirizzo_presa"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indirizzo di presa *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input {...field} placeholder="Via Roma 1, Milano" className="pl-8" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mb-6">
          {/* Indirizzo di destinazione generale */}
          <FormField
            control={control}
            name="indirizzo_destinazione"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indirizzo di destinazione *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input {...field} placeholder="Aeroporto di Malpensa, Milano" className="pl-8" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Note */}
        <div>
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
