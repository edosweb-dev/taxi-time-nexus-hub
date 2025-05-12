
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowLeft, Edit, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Servizio } from "@/lib/types/servizi";
import { getStatoBadge } from "@/components/servizi/utils";

interface ServizioHeaderProps {
  servizio: Servizio;
  onBack: () => void;
  onEdit?: () => void;
  onOpenFirma: () => void;
  showFirmaButton: boolean;
  isAdminOrSocio: boolean;
}

export function ServizioHeader({
  servizio,
  onBack,
  onEdit,
  onOpenFirma,
  showFirmaButton,
  isAdminOrSocio
}: ServizioHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Indietro
          </Button>
          {getStatoBadge(servizio.stato)}
        </div>
        <h1 className="text-3xl font-bold tracking-tight mt-4">
          {servizio.numero_commessa 
            ? `Commessa: ${servizio.numero_commessa}` 
            : "Dettaglio servizio"}
        </h1>
        <p className="text-muted-foreground">
          {format(parseISO(servizio.data_servizio), "EEEE d MMMM yyyy", { locale: it })}
        </p>
      </div>
      
      <div className="flex gap-2">
        {showFirmaButton && (
          <Button 
            variant="outline" 
            onClick={onOpenFirma}
          >
            <Pen className="mr-2 h-4 w-4" />
            Firma
          </Button>
        )}
        
        {isAdminOrSocio && onEdit && (
          <Button onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica servizio
          </Button>
        )}
      </div>
    </div>
  );
}
