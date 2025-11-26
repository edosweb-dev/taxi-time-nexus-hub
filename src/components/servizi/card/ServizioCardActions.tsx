
import { Users, CheckSquare, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Servizio } from "@/lib/types/servizi";

interface ServizioCardActionsProps {
  servizio: Servizio;
  status: string;
  isAdminOrSocio: boolean;
  onSelect: () => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
  allPasseggeriSigned?: boolean;
}

export const ServizioCardActions = ({
  servizio,
  status,
  isAdminOrSocio,
  onSelect,
  onCompleta,
  onFirma,
  allPasseggeriSigned = false,
}: ServizioCardActionsProps) => {
  // Determina se i pulsanti speciali devono essere mostrati
  const canBeCompleted = servizio.stato === 'assegnato';
  const canBeSigned = (servizio.stato === 'assegnato' || servizio.stato === 'completato') && !allPasseggeriSigned;

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="flex gap-2 mt-4">
      {status === 'da_assegnare' && isAdminOrSocio && (
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={(e) => handleClick(e, onSelect)}
        >
          <Users className="mr-2 h-4 w-4" />
          Assegna
        </Button>
      )}
      
      {canBeCompleted && onCompleta && (
        <Button 
          variant="outline" 
          size="sm"
          className="flex-1"
          onClick={(e) => handleClick(e, () => onCompleta(servizio))}
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          Completa
        </Button>
      )}
      
      {canBeSigned && onFirma && (
        <Button 
          variant="outline" 
          size="sm"
          className="flex-1"
          onClick={(e) => handleClick(e, () => onFirma(servizio))}
        >
          <Clipboard className="mr-2 h-4 w-4" />
          Firma
        </Button>
      )}
    </div>
  );
};
