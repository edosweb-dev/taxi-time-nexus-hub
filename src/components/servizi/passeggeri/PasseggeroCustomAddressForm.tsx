
import { useFormContext } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";

interface PasseggeroCustomAddressFormProps {
  index: number;
}

export const PasseggeroCustomAddressForm = ({ index }: PasseggeroCustomAddressFormProps) => {
  const { register } = useFormContext<ServizioFormData>();
  
  return (
    <div className="space-y-4 mt-4 p-3 bg-muted/50 rounded-md">
      <div>
        <label htmlFor={`passeggeri.${index}.orario_presa_personalizzato`} className="block text-sm font-medium mb-1">
          Orario di presa personalizzato
        </label>
        <input
          type="time"
          {...register(`passeggeri.${index}.orario_presa_personalizzato`)}
          className="w-full border rounded p-2"
        />
      </div>
      
      <div>
        <label htmlFor={`passeggeri.${index}.luogo_presa_personalizzato`} className="block text-sm font-medium mb-1">
          Indirizzo di presa intermedio
        </label>
        <input
          {...register(`passeggeri.${index}.luogo_presa_personalizzato`)}
          className="w-full border rounded p-2"
          placeholder="Inserisci l'indirizzo intermedio di presa"
        />
      </div>
      
      <div>
        <label htmlFor={`passeggeri.${index}.destinazione_personalizzato`} className="block text-sm font-medium mb-1">
          Destinazione intermedia
        </label>
        <input
          {...register(`passeggeri.${index}.destinazione_personalizzato`)}
          className="w-full border rounded p-2"
          placeholder="Inserisci la destinazione intermedia"
        />
      </div>
    </div>
  );
};
