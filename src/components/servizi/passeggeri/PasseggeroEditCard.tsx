
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PasseggeroBasicInfoForm } from "./PasseggeroBasicInfoForm";
import { useFormContext, useWatch } from "react-hook-form";
import { ServizioFormData } from "@/lib/types/servizi";

interface PasseggeroEditCardProps {
  index: number;
  onRemove: () => void;
}

export const PasseggeroEditCard = ({ index, onRemove }: PasseggeroEditCardProps) => {
  const { control } = useFormContext<ServizioFormData>();
  const passeggeroNome = useWatch({ control, name: `passeggeri.${index}.nome` });
  const passeggeroCognome = useWatch({ control, name: `passeggeri.${index}.cognome` });
  const nomeCompleto = `${passeggeroNome || ''} ${passeggeroCognome || ''}`.trim() || `Passeggero ${index + 1}`;
  
  const handleRemove = () => {
    if (confirm(`Rimuovere ${nomeCompleto} dal servizio?`)) {
      onRemove();
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium">Passeggero {index + 1}</h3>
          <Button 
            variant="ghost" 
            size="lg" 
            onClick={handleRemove}
            className="h-11 w-11 p-0"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Rimuovi {nomeCompleto}</span>
          </Button>
        </div>
        
        <PasseggeroBasicInfoForm index={index} />
      </CardContent>
    </Card>
  );
};
