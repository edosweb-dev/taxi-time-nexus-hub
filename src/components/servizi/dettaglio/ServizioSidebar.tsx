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
    <div className="w-64 border-r bg-muted/30 p-4 space-y-4 sticky top-0 h-screen overflow-y-auto">
      {/* ID Servizio e Stato */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Servizio</div>
        <div className="text-xl font-bold">#{servizio.id.slice(0, 8)}</div>
        
        <Badge className={cn("text-xs", badgeStyle.bg, badgeStyle.text, badgeStyle.border)}>
          {statusLabel}
        </Badge>
      </div>

      {/* Informazioni essenziali */}
      <div className="space-y-2 text-xs pb-4 border-b">
        {/* Data */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(servizio.data_servizio)}</span>
        </div>
        
        {/* Ora */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Navigation className="h-3.5 w-3.5" />
          <span>ore {formatTime(servizio.orario_servizio)}</span>
        </div>

        {/* Percorso */}
        <div className="flex items-start gap-1.5 text-muted-foreground pt-1">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground text-sm truncate">
              {servizio.citta_presa || servizio.indirizzo_presa.split(',')[0]}
            </div>
            <div className="text-muted-foreground/60 my-0.5">↓</div>
            <div className="font-medium text-foreground text-sm truncate">
              {servizio.citta_destinazione || servizio.indirizzo_destinazione.split(',')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Azioni principali */}
      <div className="space-y-1.5 pt-3 border-t">
        {canBeEdited && (
          <Button onClick={onEdit} className="w-full h-8" size="sm">
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">Modifica</span>
          </Button>
        )}

        {canBeCompleted && (
          <Button
            onClick={onCompleta}
            className="w-full h-8"
            variant="default"
            size="sm"
          >
            <Check className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">Completa</span>
          </Button>
        )}

        {canBeConsuntivato && (
          <Button
            onClick={onConsuntiva}
            className="w-full h-8"
            variant="default"
            size="sm"
          >
            <Calculator className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">Consuntiva</span>
          </Button>
        )}

        {canRequestSignature && (
            <Button
              onClick={onRichiestiFirma}
              className="w-full h-8"
              variant="outline"
              size="sm"
            >
              <FileSignature className="mr-1.5 h-3.5 w-3.5" />
              <span className="text-xs">Richiedi Firma</span>
            </Button>
          )}

        {servizio.stato === "da_assegnare" && isAdmin && (
          <Button onClick={onAssegna} className="w-full h-8" size="sm">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            <span className="text-xs">Assegna</span>
          </Button>
        )}

        {/* Menu azioni secondarie */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full h-8" size="sm">
              <MoreVertical className="mr-1.5 h-3.5 w-3.5" />
              <span className="text-xs">Altro</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isAdmin && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
