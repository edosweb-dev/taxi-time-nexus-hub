import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Car, FileText, Eye, CheckCircle } from "lucide-react";
import { ServizioWithRelations } from "@/lib/api/dipendente/servizi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ServizioCardProps {
  servizio: ServizioWithRelations;
  onViewDetails: (id: string) => void;
  onCompleta?: (id: string) => void;
}

export const ServizioCard = ({ servizio, onViewDetails, onCompleta }: ServizioCardProps) => {
  const getStatoBadge = (stato: string) => {
    const configs: Record<string, { label: string; className: string; emoji: string }> = {
      assegnato: { 
        label: "Assegnato", 
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        emoji: "🟡"
      },
      completato: { 
        label: "Completato", 
        className: "bg-green-100 text-green-800 border-green-200",
        emoji: "🟢"
      },
      consuntivato: { 
        label: "Consuntivato", 
        className: "bg-blue-100 text-blue-800 border-blue-200",
        emoji: "🔵"
      }
    };

    const config = configs[stato] || configs.assegnato;
    return (
      <Badge variant="outline" className={cn("font-medium", config.className)}>
        {config.emoji} {config.label}
      </Badge>
    );
  };

  const getCardBorderColor = (stato: string) => {
    const colors: Record<string, string> = {
      assegnato: "border-l-4 border-l-yellow-400",
      completato: "border-l-4 border-l-green-400",
      consuntivato: "border-l-4 border-l-blue-400"
    };
    return colors[stato] || colors.assegnato;
  };

  return (
    <Card 
      className={cn(
        "p-4 hover:shadow-md transition-all cursor-pointer min-h-[120px]",
        getCardBorderColor(servizio.stato)
      )}
      onClick={() => onViewDetails(servizio.id)}
    >
      <div className="space-y-3">
        {/* Header: Badge + Orario */}
        <div className="flex items-center justify-between">
          {getStatoBadge(servizio.stato)}
          <span className="text-lg font-bold">
            {servizio.orario_servizio}
          </span>
        </div>

        {/* Azienda */}
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-semibold truncate">
            {servizio.azienda_nome || servizio.aziende?.nome || "Azienda sconosciuta"}
          </span>
        </div>

        {/* Percorso */}
        <div className="space-y-1 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="truncate">{servizio.indirizzo_presa}</div>
              <div className="text-muted-foreground">→</div>
              <div className="truncate">{servizio.indirizzo_destinazione}</div>
            </div>
          </div>
        </div>

        {/* Veicolo */}
        {servizio.veicolo_modello && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {servizio.veicolo_modello}
              {servizio.veicolo_targa && ` - ${servizio.veicolo_targa}`}
            </span>
          </div>
        )}

        {/* Numero Commessa */}
        {servizio.numero_commessa && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3 flex-shrink-0" />
            <span>Commessa: {servizio.numero_commessa}</span>
          </div>
        )}

        {/* Conditional Info */}
        {servizio.stato === 'completato' && servizio.firma_timestamp && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Completato alle {format(new Date(servizio.firma_timestamp), "HH:mm", { locale: it })}
          </div>
        )}

        {servizio.stato === 'consuntivato' && (
          <div className="text-xs text-muted-foreground pt-2 border-t flex gap-4">
            {servizio.incasso_ricevuto && (
              <span>Incasso: €{servizio.incasso_ricevuto.toFixed(2)}</span>
            )}
            {servizio.ore_effettive && (
              <span>Ore: {servizio.ore_effettive}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails(servizio.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Dettagli
          </Button>
          
          {servizio.stato === 'assegnato' && onCompleta && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={() => onCompleta(servizio.id)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completa
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
