
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { PasseggeroCustomAddressForm } from "./PasseggeroCustomAddressForm";
import { MobileInput } from "@/components/ui/mobile-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface PasseggeroBasicInfoFormProps {
  index: number;
  onSave?: () => void;
  onCancel?: () => void;
}

export const PasseggeroBasicInfoForm = ({ index, onSave, onCancel }: PasseggeroBasicInfoFormProps) => {
  const { control, setValue } = useFormContext<ServizioFormData>();
  
  const usaIndirizzoPersonalizzato = useWatch({
    control,
    name: `passeggeri.${index}.usa_indirizzo_personalizzato`
  });
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`passeggeri.${index}.nome`} className="block text-sm font-medium mb-2">
            Nome
          </label>
          <Controller
            control={control}
            name={`passeggeri.${index}.nome`}
            render={({ field }) => (
              <MobileInput
                {...field}
                value={field.value || ''}
                placeholder="Nome"
              />
            )}
          />
        </div>
        <div>
          <label htmlFor={`passeggeri.${index}.cognome`} className="block text-sm font-medium mb-2">
            Cognome
          </label>
          <Controller
            control={control}
            name={`passeggeri.${index}.cognome`}
            render={({ field }) => (
              <MobileInput
                {...field}
                value={field.value || ''}
                placeholder="Cognome"
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`passeggeri.${index}.localita`} className="block text-sm font-medium mb-2">
            Località
          </label>
          <Controller
            control={control}
            name={`passeggeri.${index}.localita`}
            render={({ field }) => (
              <MobileInput
                {...field}
                value={field.value || ''}
                placeholder="Città/Località"
              />
            )}
          />
        </div>
        <div>
          <label htmlFor={`passeggeri.${index}.indirizzo`} className="block text-sm font-medium mb-2">
            Indirizzo
          </label>
          <Controller
            control={control}
            name={`passeggeri.${index}.indirizzo`}
            render={({ field }) => (
              <MobileInput
                {...field}
                value={field.value || ''}
                placeholder="Via, numero civico"
              />
            )}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`passeggeri.${index}.telefono`} className="block text-sm font-medium mb-2">
            Telefono
          </label>
          <Controller
            control={control}
            name={`passeggeri.${index}.telefono`}
            render={({ field }) => (
              <MobileInput
                {...field}
                value={field.value || ''}
                type="tel"
                placeholder="Numero telefono"
              />
            )}
          />
        </div>
        <div>
          <label htmlFor={`passeggeri.${index}.email`} className="block text-sm font-medium mb-2">
            Email aziendale
          </label>
          <Controller
            control={control}
            name={`passeggeri.${index}.email`}
            render={({ field }) => (
              <MobileInput
                {...field}
                value={field.value || ''}
                type="email"
                placeholder="email@azienda.com"
              />
            )}
          />
        </div>
      </div>

      {/* Pulsanti Salva/Annulla dopo email */}
      {(onSave || onCancel) && (
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Annulla
            </Button>
          )}
          {onSave && (
            <Button 
              variant="default" 
              onClick={onSave}
              className="w-full sm:w-auto"
            >
              Salva
            </Button>
          )}
        </div>
      )}

      {/* Checkbox per attivare indirizzi personalizzati */}
      <div className="pt-4 border-t">
        <FormField
          name={`passeggeri.${index}.usa_indirizzo_personalizzato`}
          render={({ field }) => (
            <FormItem className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      setValue(`passeggeri.${index}.usa_indirizzo_personalizzato`, !!checked);
                    }}
                    className="h-5 w-5 mt-0.5"
                  />
                </FormControl>
                <div className="flex-1">
                  <FormLabel className="text-sm font-medium cursor-pointer block">
                    📍 Indirizzi personalizzati
                  </FormLabel>
                  <p className="text-xs text-muted-foreground mt-1">
                    Attiva per impostare orari e luoghi di presa/destinazione specifici
                  </p>
                </div>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Campi indirizzi personalizzati (visibili solo se attivati) */}
      {usaIndirizzoPersonalizzato && (
        <PasseggeroCustomAddressForm index={index} />
      )}
    </div>
  );
};
