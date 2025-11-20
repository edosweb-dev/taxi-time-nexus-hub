import { useFormContext, Controller } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { MobileInput } from "@/components/ui/mobile-input";

interface PasseggeroCustomAddressFormProps {
  index: number;
}

export const PasseggeroCustomAddressForm = ({ index }: PasseggeroCustomAddressFormProps) => {
  const { control } = useFormContext<ServizioFormData>();
  
  return (
    <div className="space-y-4 mt-4 p-3 bg-muted/50 rounded-md">
      <div>
        <label htmlFor={`passeggeri.${index}.orario_presa_personalizzato`} className="block text-sm font-medium mb-2">
          Orario di presa personalizzato
        </label>
        <Controller
          control={control}
          name={`passeggeri.${index}.orario_presa_personalizzato`}
          render={({ field }) => (
            <MobileInput
              {...field}
              value={field.value || ''}
              type="time"
            />
          )}
        />
      </div>
      
      <div>
        <label htmlFor={`passeggeri.${index}.luogo_presa_personalizzato`} className="block text-sm font-medium mb-2">
          Indirizzo di presa intermedio
        </label>
        <Controller
          control={control}
          name={`passeggeri.${index}.luogo_presa_personalizzato`}
          render={({ field }) => (
            <MobileInput
              {...field}
              value={field.value || ''}
              placeholder="Inserisci l'indirizzo intermedio di presa"
            />
          )}
        />
      </div>
      
      <div>
        <label htmlFor={`passeggeri.${index}.destinazione_personalizzato`} className="block text-sm font-medium mb-2">
          Destinazione intermedia
        </label>
        <Controller
          control={control}
          name={`passeggeri.${index}.destinazione_personalizzato`}
          render={({ field }) => (
            <MobileInput
              {...field}
              value={field.value || ''}
              placeholder="Inserisci la destinazione intermedia"
            />
          )}
        />
      </div>
    </div>
  );
};
