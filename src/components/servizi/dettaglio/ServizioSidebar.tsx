import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Pencil, Check, Calculator, MoreVertical, 
  Trash2, FileSignature, UserPlus,
  Calendar, Navigation
} from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { getStatusBadgeStyle, getStatusLabel } from "./utils/statusStyles";
import { cn } from "@/lib/utils";

interface ServizioSidebarProps {
  servizio: Servizio;
  canBeEdited: boolean;
  canBeCompleted: boolean;
  canBeConsuntivato: boolean;
  canRequestSignature: boolean;
  isAdmin: boolean;
  users: Profile[];
  getAziendaName: (id?: string) => string;
  getUserName: (users: Profile[], id?: string) => string | null;
  onEdit: () => void;
  onCompleta: () => void;
  onConsuntiva: () => void;
  onRichiestiFirma: () => void;
  onAssegna: () => void;
  onDelete: () => void;
  veicoloModello?: string;
}

export function ServizioSidebar({
  servizio,
  canBeEdited,
  canBeCompleted,
  canBeConsuntivato,
  canRequestSignature,
  isAdmin,
  users,
  getAziendaName,
  getUserName,
  veicoloModello,
  onEdit,
  onCompleta,
  onConsuntiva,
  onRichiestiFirma,
  onAssegna,
  onDelete,
}: ServizioSidebarProps) {
  const badgeStyle = getStatusBadgeStyle(servizio.stato);
  const statusLabel = getStatusLabel(servizio.stato);
  
  const formatTime = (time?: string) => {
    if (!time) return "—";
    return time.substring(0, 5); // HH:MM
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="w-72 bg-muted/30 rounded-lg p-6 space-y-6">
      {/* Header: Numero servizio */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Servizio #{servizio.id.substring(0, 8).toUpperCase()}
        </h2>
      </div>

      {/* Badge Stato - LARGE */}
      <div>
        <div className={cn(
          "inline-flex items-center gap-2 rounded-md px-4 py-3 text-lg font-semibold border-2",
          badgeStyle.bg,
          badgeStyle.text,
          badgeStyle.border
        )}>
          <span>{badgeStyle.icon}</span>
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Info critiche sempre visibili */}
      <div className="space-y-4 pb-4 border-b border-border">
        {/* Data/Orario compatto */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium">
              {formatDate(servizio.data_servizio)}
            </div>
            <div className="text-xs text-muted-foreground">
              ore {formatTime(servizio.orario_servizio)}
            </div>
          </div>
        </div>

        {/* Percorso one-liner */}
        <div className="flex items-start gap-3">
          <Navigation className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" title={`${servizio.citta_presa || servizio.indirizzo_presa} → ${servizio.citta_destinazione || servizio.indirizzo_destinazione}`}>
              {servizio.citta_presa || servizio.indirizzo_presa.split(',')[0]} → {servizio.citta_destinazione || servizio.indirizzo_destinazione.split(',')[0]}
            </div>
            <div className="text-xs text-muted-foreground">
              Percorso servizio
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="border-t pt-4 space-y-2">
        {canBeEdited && (
          <Button 
            onClick={onEdit}
            className="w-full h-11 text-base"
            size="default"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Modifica
          </Button>
        )}

        {canBeCompleted && (
          <Button
            onClick={onCompleta}
            variant="secondary"
            className="w-full h-11"
          >
            <Check className="mr-2 h-4 w-4" />
            Completa Servizio
          </Button>
        )}

        {canBeConsuntivato && (
          <Button
            onClick={onConsuntiva}
            variant="secondary"
            className="w-full h-11"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Consuntiva
          </Button>
        )}

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full h-11">
              <MoreVertical className="mr-2 h-4 w-4" />
              Altro
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {canRequestSignature && (
              <DropdownMenuItem onClick={onRichiestiFirma}>
                <FileSignature className="mr-2 h-4 w-4" />
                Richiedi Firma Cliente
              </DropdownMenuItem>
            )}
            {isAdmin && servizio.stato === 'da_assegnare' && (
              <DropdownMenuItem onClick={onAssegna}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assegna Servizio
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Elimina
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
