
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
  allPasseggeriSigned?: boolean;
  firmePasseggeri?: number;
  totalPasseggeri?: number;
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
  onFirma,
  allPasseggeriSigned = false,
  firmePasseggeri = 0,
  totalPasseggeri = 0,
}) => {
  // Calcola l'indice globale stabile basato sulla data di creazione
  const globalIndex = getServizioIndex(servizio.id, allServizi || []);
  // Logica ottimizzata per pulsanti in base allo stato
  const isToAssign = servizio.stato === 'da_assegnare';
  const isConsuntivato = servizio.stato === 'consuntivato';
  const canBeAssigned = isAdminOrSocio && onSelect && isToAssign;
  const canBeCompleted = !isToAssign && !isConsuntivato && onCompleta && servizio.stato === 'assegnato';
  const canBeSigned = !isToAssign && !isConsuntivato && onFirma && ['assegnato', 'completato'].includes(servizio.stato) && !allPasseggeriSigned;
  // Per i consuntivati, mostriamo solo azioni di modifica/dettagli
  const showOnlyEditActions = isConsuntivato;

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
            ) : showOnlyEditActions ? (
              /* Per consuntivati: solo pulsante Modifica diretto */
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToDetail(servizio.id);
                }}
                className="h-8 px-2"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Modifica
              </Button>
            ) : (
              <>
                {/* Se già assegnato (non consuntivato): mostra pulsanti Completa e Firma */}
                {canBeCompleted && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleta?.(servizio);
                    }}
                    className="h-8 px-2"
                  >
                    <CheckSquare className="h-3 w-3" />
                  </Button>
                )}
                
                {canBeSigned && (
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFirma?.(servizio);
                    }}
                    className="h-8 px-2"
                  >
                    <Clipboard className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
            
            {/* Menu dropdown sempre presente per dettagli/modifica/elimina */}
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
                  {showOnlyEditActions ? 'Modifica' : 'Dettagli'}
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
