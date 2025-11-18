
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { PasseggeroCustomAddressForm } from "./PasseggeroCustomAddressForm";
import { MobileInput } from "@/components/ui/mobile-input";

interface PasseggeroBasicInfoFormProps {
  index: number;
}

export const PasseggeroBasicInfoForm = ({ index }: PasseggeroBasicInfoFormProps) => {
  const { control, watch, setValue } = useFormContext<ServizioFormData>();
  const usaIndirizzoPersonalizzato = watch(`passeggeri.${index}.usa_indirizzo_personalizzato`);
  
  // Watch the entire passeggeri array to determine if we should show the intermediate address option
  const passeggeri = useWatch({ control, name: "passeggeri" }) || [];
  // Only show the checkbox if there are 2 or more passengers
  const showIntermediateAddressOption = passeggeri.length >= 2;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
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
      
      <div className="grid grid-cols-2 gap-4">
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

      {showIntermediateAddressOption && (
        <FormField
          name={`passeggeri.${index}.usa_indirizzo_personalizzato`}
          render={({ field }) => (
            <FormItem className="col-span-full p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      setValue(`passeggeri.${index}.usa_indirizzo_personalizzato`, !!checked);
                    }}
                    className="h-6 w-6"
                  />
                </FormControl>
                <FormLabel className="text-base font-medium cursor-pointer flex-1">
                  📍 Indirizzo di presa personalizzato
                </FormLabel>
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-9">
                Attiva se questo passeggero ha un punto di ritiro diverso
              </p>
            </FormItem>
          )}
        />
      )}

      {usaIndirizzoPersonalizzato && <PasseggeroCustomAddressForm index={index} />}
    </div>
  );
};
