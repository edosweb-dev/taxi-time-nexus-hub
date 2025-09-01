import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ServizioFormData } from "@/lib/types/servizi";
import { useAziende } from "@/hooks/useAziende";
import { Badge } from "@/components/ui/badge";

export function ProvvigioneServizioField() {
  const { control } = useFormContext<ServizioFormData>();
  const { aziende } = useAziende();
  
  // Watch azienda_id per recuperare i dati dell'azienda
  const azienda_id = useWatch({ control, name: "azienda_id" });
  
  // Trova l'azienda selezionata
  const aziendaSelezionata = aziende?.find(a => a.id === azienda_id);
  
  // Se l'azienda non ha la provvigione attiva, non mostrare il campo
  if (!aziendaSelezionata?.provvigione) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-lg font-medium text-foreground">Gestione Provvigione</h4>
          <p className="text-sm text-muted-foreground">
            L'azienda ha la provvigione attiva. Scegli se applicarla a questo servizio.
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Provvigione: {aziendaSelezionata.provvigione_tipo === 'percentuale' 
            ? `${aziendaSelezionata.provvigione_valore}%` 
            : `€${aziendaSelezionata.provvigione_valore}`}
        </Badge>
      </div>
      
      <FormField
        control={control}
        name="applica_provvigione"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                Applica provvigione a questo servizio
              </FormLabel>
              <FormDescription>
                Attiva questa opzione per applicare la provvigione configurata per l'azienda
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}