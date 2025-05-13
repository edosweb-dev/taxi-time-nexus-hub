
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, CheckCircle2, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Servizio } from "@/lib/types/servizi";
import { getStatoBadge } from "@/components/servizi/utils";

interface ServizioHeaderProps {
  servizio: Servizio;
  canBeEdited: boolean;
  canBeCompleted: boolean;
  canBeConsuntivato: boolean;
  onCompleta: () => void;
  onConsuntiva: () => void;
}

export function ServizioHeader({
  servizio,
  canBeEdited,
  canBeCompleted,
  canBeConsuntivato,
  onCompleta,
  onConsuntiva
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
        <p className="text-muted-foreground">
          {format(parseISO(servizio.data_servizio), "EEEE d MMMM yyyy", { locale: it })}
        </p>
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
