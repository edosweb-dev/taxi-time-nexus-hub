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
  Building2, Calendar, Navigation, User, Car, CreditCard
} from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getStatusBadgeStyle, getStatusLabel } from "./utils/statusStyles";

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
  onEdit,
  onCompleta,
  onConsuntiva,
  onRichiestiFirma,
  onAssegna,
  onDelete,
  veicoloModello,
}: ServizioSidebarProps) {
  const statusStyle = getStatusBadgeStyle(servizio.stato);
  
  return (
    <div className="bg-muted/30 rounded-lg p-6 space-y-6 border">
      {/* Service Number */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold tracking-tight">
          SERVIZIO #{servizio.numero_commessa || servizio.id.slice(0, 8).toUpperCase()}
        </h2>
        
        {/* Large Status Badge */}
        <Badge 
          className={`
            ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}
            text-lg font-semibold py-3 px-4 w-full justify-center
            border-2 rounded-lg
          `}
        >
          {statusStyle.icon} {getStatusLabel(servizio.stato)}
        </Badge>
      </div>

      <div className="border-t pt-4 space-y-4">
        {/* Critical Info */}
        <div className="space-y-3 text-sm">
          {/* Azienda */}
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Azienda</div>
              <div className="font-medium truncate">
                {getAziendaName(servizio.azienda_id)}
              </div>
            </div>
          </div>

          {/* Data/Orario */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Data e Ora</div>
              <div className="font-medium">
                {format(new Date(servizio.data_servizio), 'dd MMM yyyy', { locale: it })}
              </div>
              <div className="text-muted-foreground">
                {servizio.orario_servizio}
              </div>
            </div>
          </div>

          {/* Percorso One-liner */}
          <div className="flex items-start gap-2">
            <Navigation className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Percorso</div>
              <div className="font-medium truncate">
                {servizio.citta_presa || 'Partenza'} → {servizio.citta_destinazione || 'Arrivo'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Info Rapide
          </div>
          
          {servizio.assegnato_a && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground shrink-0">Conducente:</span>
              <span className="font-medium truncate">
                {getUserName(users, servizio.assegnato_a) || 'N/A'}
              </span>
            </div>
          )}

          {veicoloModello && (
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground shrink-0">Veicolo:</span>
              <span className="font-medium truncate">
                {veicoloModello}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0">Pagamento:</span>
            <span className="font-medium truncate">
              {servizio.metodo_pagamento}
            </span>
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
