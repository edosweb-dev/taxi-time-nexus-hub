
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
    <div className="bg-card border rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left Side - Title and Info */}
        <div className="space-y-3">
          {/* Breadcrumb and Status */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/servizi")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna ai servizi
            </Button>
            {getStatoBadge(servizio.stato)}
          </div>
          
          {/* Main Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {servizio.numero_commessa 
                ? `Commessa ${servizio.numero_commessa}` 
                : "Dettaglio servizio"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center">
                <FileDigit className="h-4 w-4 mr-1" />
                ID: {formatProgressiveId(servizio.id, index)}
              </div>
              <div className="flex items-center">
                <span className="h-1 w-1 bg-muted-foreground rounded-full mr-2" />
                {format(parseISO(servizio.data_servizio), "EEEE d MMMM yyyy", { locale: it })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Desktop Actions */}
        <div className="hidden sm:flex gap-2">
          {canBeCompleted && (
            <Button onClick={onCompleta} className="whitespace-nowrap">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Completa
            </Button>
          )}
          
          {canBeConsuntivato && (
            <Button onClick={onConsuntiva} variant="secondary" className="whitespace-nowrap">
              <FileText className="mr-2 h-4 w-4" />
              Consuntiva
            </Button>
          )}
          
          {canBeEdited && (
            <Button onClick={() => navigate(`/servizi/${servizio.id}/edit`)} variant="outline" className="whitespace-nowrap">
              <Edit className="mr-2 h-4 w-4" />
              Modifica
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
