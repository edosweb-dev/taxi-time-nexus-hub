import { useFormContext, useWatch } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MobileInput } from "@/components/ui/mobile-input";
import { Settings } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona metodo di pagamento" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {metodiPagamento.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona veicolo (opzionale)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Nessun veicolo</SelectItem>
                </SelectContent>
              </Select>
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
