
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";
import { ProvvigioneFields } from "./ProvvigioneFields";

interface AziendaSettingsFieldsProps {
  control: Control<any>;
}

export function AziendaSettingsFields({ control }: AziendaSettingsFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="firma_digitale_attiva"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Firma Digitale</FormLabel>
              <FormDescription>
                Abilita la firma digitale per i servizi di questa azienda
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
      
      <FormField
        control={control}
        name="provvigione"
        render={({ field }) => (
          <FormItem className="flex flex-col rounded-lg border p-4">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Provvigione</FormLabel>
                <FormDescription>
                  Abilita la gestione delle provvigioni per questa azienda
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </div>
            <ProvvigioneFields control={control} />
          </FormItem>
        )}
      />
    </div>
  );
}
