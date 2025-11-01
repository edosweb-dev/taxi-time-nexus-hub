
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
  const globalIndex = getServizioIndex(servizio.id, allServizi || []);
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
          <span className="text-sm">
            {servizio.conducente_esterno_nome || "Conducente esterno"}
          </span>
        ) : servizio.assegnato_a && (servizio as any).assegnato ? (
          <span className="text-sm">
            {(servizio as any).assegnato.first_name} {(servizio as any).assegnato.last_name}
          </span>
        ) : servizio.assegnato_a ? (
          <span className="text-sm text-muted-foreground">
            {getUserName(users, servizio.assegnato_a) || "Dipendente"}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">Non assegnato</span>
        )}
      </TableCell>
        <TableCell className="w-32">
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                    className="h-8 px-2"
                  >
                    <Users className="h-3 w-3" />
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
                  className="h-8 px-2"
                  style={{ opacity: canBeCompleted ? 1 : 0.3 }}
                >
                  <CheckSquare className="h-3 w-3" />
                </Button>
                
                <Button 
                  variant={canBeSigned ? "outline" : "ghost"}
                  size="sm"
                  disabled={!canBeSigned}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canBeSigned) onFirma?.(servizio);
                  }}
                  className="h-8 px-2"
                  style={{ opacity: canBeSigned ? 1 : 0.3 }}
                >
                  <Clipboard className="h-3 w-3" />
                </Button>
              </>
            )}
            
            {/* Menu dropdown sempre presente per dettagli */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={(e) => e.stopPropagation()}>
                  <ChevronDown className="h-3 w-3" />
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
          <TableCell colSpan={8} className="bg-muted/30 p-4">
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
