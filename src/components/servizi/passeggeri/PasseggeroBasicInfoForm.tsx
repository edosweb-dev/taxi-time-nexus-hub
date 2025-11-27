
import { useFormContext, Controller } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";
import { PasseggeroCustomAddressForm } from "./PasseggeroCustomAddressForm";
import { MobileInput } from "@/components/ui/mobile-input";
import { Button } from "@/components/ui/button";

interface PasseggeroBasicInfoFormProps {
  index: number;
  onSave?: () => void;
  onCancel?: () => void;
}

export const PasseggeroBasicInfoForm = ({ index, onSave, onCancel }: PasseggeroBasicInfoFormProps) => {
  const { control } = useFormContext<ServizioFormData>();
  
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

      {/* Indirizzi personalizzati sempre visibili */}
      <div className="pt-4 border-t">
        <div className="mb-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            📍 Indirizzi personalizzati
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Imposta orari e luoghi di presa/destinazione specifici per questo passeggero
          </p>
        </div>
        <PasseggeroCustomAddressForm index={index} />
      </div>
    </div>
  );
};
