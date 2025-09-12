
import React from "react";
import { format, parseISO } from "date-fns";
import { Users, ChevronDown, Clipboard, CheckSquare, Pencil } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { getStatoBadge, getUserName } from "./utils";
import { ServizioExpandedRow } from "./ServizioExpandedRow";
import { formatProgressiveId, getServizioIndex } from "./utils/formatUtils";

interface ServizioTableRowProps {
  servizio: Servizio;
  users: Profile[];
  aziendaName: string;
  passengerCount: number;
  isExpanded: boolean;
  isAdminOrSocio: boolean;
  allServizi: Servizio[]; // Changed from index to allServizi
  onToggleExpand: (id: string) => void;
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void;
  onCompleta?: (servizio: Servizio) => void; // Nuovo handler per completamento
  onFirma?: (servizio: Servizio) => void; // Nuovo handler per firma
}

export const ServizioTableRow: React.FC<ServizioTableRowProps> = ({
  servizio,
  users,
  aziendaName,
  passengerCount,
  isExpanded,
  isAdminOrSocio,
  allServizi,
  onToggleExpand,
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma
}) => {
  // Calcola l'indice globale stabile basato sulla data di creazione
  const globalIndex = getServizioIndex(servizio.id, allServizi);
  // Logica ottimizzata per pulsanti in base allo stato
  const isToAssign = servizio.stato === 'da_assegnare';
  const canBeAssigned = isAdminOrSocio && onSelect && isToAssign;
  const canBeCompleted = !isToAssign && onCompleta && servizio.stato === 'assegnato';
  const canBeSigned = !isToAssign && onFirma && ['assegnato', 'completato'].includes(servizio.stato) && !servizio.firma_url;

  return (
    <>
      <TableRow
        key={servizio.id}
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => onToggleExpand(servizio.id)}
      >
        <TableCell className="font-medium">
          {formatProgressiveId(servizio.id, globalIndex)}
        </TableCell>
        <TableCell className="font-medium">
          {servizio.numero_commessa || "N/D"}
        </TableCell>
        <TableCell>{aziendaName}</TableCell>
        <TableCell>{format(parseISO(servizio.data_servizio), "dd/MM/yyyy")}</TableCell>
        <TableCell>{servizio.orario_servizio}</TableCell>
        <TableCell>{getStatoBadge(servizio.stato)}</TableCell>
        <TableCell>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {passengerCount}
          </div>
        </TableCell>
        <TableCell>
          {servizio.conducente_esterno ? (
            <span>{servizio.conducente_esterno_nome || "Conducente esterno"}</span>
          ) : servizio.assegnato_a ? (
            <span>{getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}</span>
          ) : (
            <span className="text-muted-foreground">Non assegnato</span>
          )}
        </TableCell>
        <TableCell className="w-48">
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {/* Se da assegnare: mostra solo pulsante Assegna */}
            {isToAssign ? (
              <>
                {canBeAssigned && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(servizio);
                    }}
                    className="min-w-[80px]"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Assegna</span>
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Se già assegnato: mostra pulsanti Completa e Firma */}
                <Button 
                  variant={canBeCompleted ? "outline" : "ghost"} 
                  size="sm"
                  disabled={!canBeCompleted}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canBeCompleted) onCompleta?.(servizio);
                  }}
                  className="min-w-[80px]"
                  style={{ opacity: canBeCompleted ? 1 : 0.5 }}
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Completa</span>
                </Button>
                
                <Button 
                  variant={canBeSigned ? "outline" : "ghost"}
                  size="sm"
                  disabled={!canBeSigned}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canBeSigned) onFirma?.(servizio);
                  }}
                  className="min-w-[70px]"
                  style={{ opacity: canBeSigned ? 1 : 0.5 }}
                >
                  <Clipboard className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Firma</span>
                </Button>
              </>
            )}
            
            {/* Menu dropdown sempre presente per dettagli */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToDetail(servizio.id);
                }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Dettagli
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={9} className="bg-muted/30 p-4">
            <ServizioExpandedRow 
              servizio={servizio}
              users={users}
              onNavigateToDetail={onNavigateToDetail}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
