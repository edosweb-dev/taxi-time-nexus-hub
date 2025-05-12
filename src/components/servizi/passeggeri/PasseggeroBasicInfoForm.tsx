
import { useFormContext, useWatch } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { PasseggeroCustomAddressForm } from "./PasseggeroCustomAddressForm";

interface PasseggeroBasicInfoFormProps {
  index: number;
}

export const PasseggeroBasicInfoForm = ({ index }: PasseggeroBasicInfoFormProps) => {
  const { register, watch, setValue, control } = useFormContext<ServizioFormData>();
  const usaIndirizzoPersonalizzato = watch(`passeggeri.${index}.usa_indirizzo_personalizzato`);
  
  // Watch the entire passeggeri array to determine if we should show the intermediate address option
  const passeggeri = useWatch({ control, name: "passeggeri" }) || [];
  // Only show the checkbox if there are 2 or more passengers
  const showIntermediateAddressOption = passeggeri.length >= 2;
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={`passeggeri.${index}.nome_cognome`} className="block text-sm font-medium mb-1">
          Nome e cognome
        </label>
        <input
          {...register(`passeggeri.${index}.nome_cognome`)}
          className="w-full border rounded p-2"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`passeggeri.${index}.telefono`} className="block text-sm font-medium mb-1">
            Telefono
          </label>
          <input
            {...register(`passeggeri.${index}.telefono`)}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label htmlFor={`passeggeri.${index}.email`} className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            {...register(`passeggeri.${index}.email`)}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {showIntermediateAddressOption && (
        <FormField
          name={`passeggeri.${index}.usa_indirizzo_personalizzato`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    setValue(`passeggeri.${index}.usa_indirizzo_personalizzato`, !!checked);
                  }}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Questo passeggero ha indirizzi intermedi diversi
              </FormLabel>
            </FormItem>
          )}
        />
      )}

      {usaIndirizzoPersonalizzato && <PasseggeroCustomAddressForm index={index} />}
    </div>
  );
};
