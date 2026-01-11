
import { Users, CheckSquare, Clipboard, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Servizio } from "@/lib/types/servizi";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  // Determina se i pulsanti speciali devono essere mostrati
  const isConsuntivato = servizio.stato === 'consuntivato';
  const canBeCompleted = servizio.stato === 'assegnato';
  const canBeSigned = (servizio.stato === 'assegnato' || servizio.stato === 'completato') && !allPasseggeriSigned;

  const handleClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  // Per servizi consuntivati: solo pulsante Modifica
  if (isConsuntivato) {
    return (
      <div className="flex gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={(e) => handleClick(e, () => navigate(`/servizi/${servizio.id}`))}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Modifica
        </Button>
      </div>
    );
  }

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
