import { useFormContext, useWatch } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MobileInput } from "@/components/ui/mobile-input";
import { Settings } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { MobileSelect, SelectItem } from "@/components/ui/mobile-select";
import { ProvvigioneServizioField } from "../ProvvigioneServizioField";
import { ServizioFormData } from "@/lib/types/servizi";
import { useImpostazioni } from "@/hooks/useImpostazioni";
import { useAuth } from "@/contexts/AuthContext";

export const Step2DettagliOperativi = () => {
  const { control, register } = useFormContext<ServizioFormData>();
  const { impostazioni } = useImpostazioni();
  const { profile } = useAuth();
  
  const canEditOreFields = profile?.role === 'admin' || profile?.role === 'socio';
  const metodiPagamento = impostazioni?.metodi_pagamento?.map(m => m.nome) || [];

  return (
    <Card className="p-6 md:p-8 space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Settings className="h-5 w-5" />
        Dettagli Operativi
      </h3>

      <FormField
        control={control}
        name="metodo_pagamento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Metodo di pagamento *</FormLabel>
            <FormControl>
              <MobileSelect
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Seleziona metodo di pagamento"
              >
                {metodiPagamento.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </MobileSelect>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <Label>Veicolo</Label>
        <FormField
          control={control}
          name="veicolo_id"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MobileSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Seleziona veicolo (opzionale)"
                >
                  <SelectItem value="">Nessun veicolo</SelectItem>
                </MobileSelect>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {canEditOreFields && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ore effettive</Label>
            <MobileInput 
              type="number" 
              step="0.1"
              placeholder="0.0"
              {...register("ore_effettive", { valueAsNumber: true })} 
            />
          </div>
          <div className="space-y-2">
            <Label>Ore fatturate</Label>
            <MobileInput 
              type="number" 
              step="0.1"
              placeholder="0.0"
              {...register("ore_fatturate", { valueAsNumber: true })} 
            />
          </div>
        </div>
      )}

      <ProvvigioneServizioField />
    </Card>
  );
};
