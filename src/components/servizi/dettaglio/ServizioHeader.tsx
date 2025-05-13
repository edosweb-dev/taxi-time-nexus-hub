
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, CheckCircle2, FileText, FileDigit } from "lucide-react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Servizio } from "@/lib/types/servizi";
import { getStatoBadge } from "@/components/servizi/utils";
import { formatProgressiveId } from "../utils/formatUtils";

interface ServizioHeaderProps {
  servizio: Servizio;
  canBeEdited: boolean;
  canBeCompleted: boolean;
  canBeConsuntivato: boolean;
  onCompleta: () => void;
  onConsuntiva: () => void;
  index?: number;
}

export function ServizioHeader({
  servizio,
  canBeEdited,
  canBeCompleted,
  canBeConsuntivato,
  onCompleta,
  onConsuntiva,
  index = 0
}: ServizioHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/servizi")}>
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex items-center">
            <FileDigit className="h-4 w-4 mr-1" />
            ID: {formatProgressiveId(servizio.id, index)}
          </div>
          <span>•</span>
          <div>
            {format(parseISO(servizio.data_servizio), "EEEE d MMMM yyyy", { locale: it })}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        {canBeCompleted && (
          <Button 
            onClick={onCompleta} 
            variant="default"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Completa servizio
          </Button>
        )}
        
        {canBeConsuntivato && (
          <Button 
            onClick={onConsuntiva} 
            variant="secondary"
          >
            <FileText className="mr-2 h-4 w-4" />
            Consuntiva
          </Button>
        )}
        
        {canBeEdited && (
          <Button onClick={() => navigate(`/servizi/${servizio.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifica
          </Button>
        )}
      </div>
    </div>
  );
}
