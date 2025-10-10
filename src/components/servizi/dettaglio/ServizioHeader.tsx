
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, CheckCircle2, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Servizio } from "@/lib/types/servizi";
import { getStatoBadge } from "@/components/servizi/utils";
import { formatProgressiveId, getServizioIndex } from "../utils/formatUtils";

interface ServizioHeaderProps {
  servizio: Servizio;
  canBeEdited: boolean;
  canBeCompleted: boolean;
  canBeConsuntivato: boolean;
  allServizi: Servizio[]; // Added for stable indexing
  onCompleta: () => void;
  onConsuntiva: () => void;
}

export function ServizioHeader({
  servizio,
  canBeEdited,
  canBeCompleted,
  canBeConsuntivato,
  allServizi,
  onCompleta,
  onConsuntiva
}: ServizioHeaderProps) {
  const navigate = useNavigate();
  
  // Calculate stable global index based on creation date
  const globalIndex = getServizioIndex(servizio.id, allServizi || []);
  
  const safeFormatISO = (iso?: string, fmt: string = "EEEE d MMMM yyyy") => {
    if (!iso) return "—";
    try {
      const d = parseISO(iso);
      if (isNaN(d.getTime())) return "—";
      return format(d, fmt, { locale: it });
    } catch {
      return "—";
    }
  };
  
  return (
    <div className="bg-card border rounded-lg p-4 md:p-6">
      <div className="flex flex-col gap-4">
        {/* Breadcrumb and Status - Mobile optimized */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/servizi")} 
            className="text-muted-foreground hover:text-foreground self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden xs:inline">Elenco servizi</span>
            <span className="xs:hidden">Indietro</span>
          </Button>
          {getStatoBadge(servizio.stato)}
        </div>
        
        {/* Main Title - Mobile optimized */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight">
            {servizio.numero_commessa 
              ? `Commessa N° ${servizio.numero_commessa}` 
              : `Servizio N° ${formatProgressiveId(servizio.id, globalIndex)}`}
          </h1>
          
          {/* Date and time - Mobile optimized */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm text-muted-foreground">
            <span className="font-medium">
              {safeFormatISO(servizio.data_servizio, "EEEE d MMMM yyyy")}
            </span>
            {servizio.orario_servizio && (
              <div className="flex items-center gap-2">
                <span className="hidden xs:block h-1 w-1 bg-muted-foreground rounded-full" />
                <span className="font-medium">ore {servizio.orario_servizio}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop Actions - Hidden on mobile since we have sticky bottom actions */}
        <div className="hidden lg:flex gap-3 justify-end">
          {canBeCompleted && (
            <Button onClick={onCompleta} size="lg" className="whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completa servizio
            </Button>
          )}
          
          {canBeConsuntivato && (
            <Button onClick={onConsuntiva} variant="secondary" size="lg" className="whitespace-nowrap">
              <FileText className="h-4 w-4 mr-2" />
              Consuntiva servizio
            </Button>
          )}
          
          {canBeEdited && (
            <Button onClick={() => navigate(`/servizi/${servizio.id}/modifica`)} variant="outline" size="lg" className="whitespace-nowrap">
              <Edit className="h-4 w-4 mr-2" />
              Modifica servizio
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
