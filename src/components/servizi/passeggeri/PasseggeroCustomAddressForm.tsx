import { useFormContext } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { MobileInput } from "@/components/ui/mobile-input";

interface PasseggeroCustomAddressFormProps {
  index: number;
}

export const PasseggeroCustomAddressForm = ({ index }: PasseggeroCustomAddressFormProps) => {
  const { register } = useFormContext<ServizioFormData>();
  
  return (
    <div className="space-y-4 mt-4 p-3 bg-muted/50 rounded-md">
      <div>
        <label htmlFor={`passeggeri.${index}.orario_presa_personalizzato`} className="block text-sm font-medium mb-2">
          Orario di presa personalizzato
        </label>
        <MobileInput
          type="time"
          {...register(`passeggeri.${index}.orario_presa_personalizzato`)}
        />
      </div>
      
      <div>
        <label htmlFor={`passeggeri.${index}.luogo_presa_personalizzato`} className="block text-sm font-medium mb-2">
          Indirizzo di presa intermedio
        </label>
        <MobileInput
          {...register(`passeggeri.${index}.luogo_presa_personalizzato`)}
          placeholder="Inserisci l'indirizzo intermedio di presa"
        />
      </div>
      
      <div>
        <label htmlFor={`passeggeri.${index}.destinazione_personalizzato`} className="block text-sm font-medium mb-2">
          Destinazione intermedia
        </label>
        <MobileInput
          {...register(`passeggeri.${index}.destinazione_personalizzato`)}
          placeholder="Inserisci la destinazione intermedia"
        />
      </div>
    </div>
  );
};
