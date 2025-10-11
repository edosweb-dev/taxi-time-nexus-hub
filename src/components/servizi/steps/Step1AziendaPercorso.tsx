import { useFormContext, useWatch } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MobileInput } from "@/components/ui/mobile-input";
import { Building2, Calendar, MapPin, User } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ServizioFormData } from "@/lib/types/servizi";
import { ClienteAziendaFields } from "../form-fields/ClienteAziendaFields";
import { ClientePrivatoFields } from "../form-fields/ClientePrivatoFields";

export const Step1AziendaPercorso = () => {
  const { register, control } = useFormContext<ServizioFormData>();
  const tipoCliente = useWatch({ control, name: "tipo_cliente" });

  return (
    <Card className="w-full p-4 md:p-6 space-y-6">
      {/* SEZIONE 1: Tipo Cliente */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          Tipo Cliente
        </h3>
        <FormField
          control={control}
          name="tipo_cliente"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="azienda" id="tipo-azienda" />
                    <Label htmlFor="tipo-azienda" className="cursor-pointer font-normal">
                      🏢 Azienda
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="privato" id="tipo-privato" />
                    <Label htmlFor="tipo-privato" className="cursor-pointer font-normal">
                      👤 Cliente Privato
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* SEZIONE 2: Dati Cliente */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          {tipoCliente === 'azienda' ? (
            <>
              <Building2 className="h-4 w-4" />
              Azienda e Contatto
            </>
          ) : (
            <>
              <User className="h-4 w-4" />
              Dati Cliente
            </>
          )}
        </h3>
        {tipoCliente === 'azienda' ? (
          <ClienteAziendaFields />
        ) : (
          <ClientePrivatoFields />
        )}
      </div>

      {/* SEZIONE 3: Data e Orario */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Data e Orario
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base md:text-sm">Data servizio *</Label>
            <MobileInput 
              type="date" 
              {...register("data_servizio")} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-base md:text-sm">Orario servizio *</Label>
            <MobileInput 
              type="time" 
              {...register("orario_servizio")} 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-base md:text-sm">Numero commessa</Label>
          <MobileInput 
            placeholder="ES-2024-001" 
            {...register("numero_commessa")} 
          />
        </div>
      </div>

      {/* SEZIONE 4: Percorso */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Percorso
        </h3>
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Partenza</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base md:text-sm">Città</Label>
              <MobileInput 
                placeholder="Milano" 
                {...register("citta_presa")} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base md:text-sm">Indirizzo di presa *</Label>
              <MobileInput 
                placeholder="Via Roma 123" 
                {...register("indirizzo_presa")} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Destinazione</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base md:text-sm">Città</Label>
              <MobileInput 
                placeholder="Ferno" 
                {...register("citta_destinazione")} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base md:text-sm">Indirizzo di destinazione *</Label>
              <MobileInput 
                placeholder="Aeroporto Malpensa" 
                {...register("indirizzo_destinazione")} 
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
