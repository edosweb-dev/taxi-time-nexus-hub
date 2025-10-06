import { useWatch, useFormContext } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";

interface PassengerListItemProps {
  index: number;
  fieldId: string;
}

export const PassengerListItem = ({ index, fieldId }: PassengerListItemProps) => {
  const { control } = useFormContext<ServizioFormData>();
  const passeggero = useWatch({ control, name: `passeggeri.${index}` });
  
  const nome = passeggero?.nome || '';
  const cognome = passeggero?.cognome || '';
  const nomeCompleto = `${nome} ${cognome}`.trim() || `Passeggero ${index + 1}`;
  
  return (
    <div className="p-3 rounded-lg border bg-background text-sm">
      <p className="font-medium truncate">{nomeCompleto}</p>
      {passeggero?.telefono && (
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {passeggero.telefono}
        </p>
      )}
    </div>
  );
};
