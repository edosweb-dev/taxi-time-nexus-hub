
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, User } from "lucide-react";
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
  
  // Nome completo con fallback
  const nomeCompleto = `${passeggeroNome || ''} ${passeggeroCognome || ''}`.trim();
  const displayName = nomeCompleto || `Passeggero ${index + 1}`;
  const hasName = nomeCompleto.length > 0;
  
  const handleRemove = () => {
    if (confirm(`Rimuovere ${displayName} dal servizio?`)) {
      onRemove();
    }
  };
  
  return (
    <Card className="border-2">
      <CardContent className="p-0">
        {/* Header dinamico con feedback visivo real-time */}
        <div className="flex items-center justify-between gap-3 p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              hasName ? 'bg-primary/20' : 'bg-muted'
            }`}>
              <User className={`h-5 w-5 transition-colors ${
                hasName ? 'text-primary' : 'text-muted-foreground'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-base truncate transition-colors ${
                hasName ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {hasName ? 'Compila le informazioni' : 'Inserisci nome e cognome'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRemove}
            className="h-9 w-9 flex-shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Rimuovi {displayName}</span>
          </Button>
        </div>
        
        {/* Form fields */}
        <div className="p-4">
          <PasseggeroBasicInfoForm index={index} />
        </div>
      </CardContent>
    </Card>
  );
};
