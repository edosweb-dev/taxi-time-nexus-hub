
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
import { formatProgressiveId } from "./utils/formatUtils";

interface ServizioTableRowProps {
  servizio: Servizio;
  users: Profile[];
  aziendaName: string;
  passengerCount: number;
  isExpanded: boolean;
  isAdminOrSocio: boolean;
  index: number; // Aggiunto indice per l'ID progressivo
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
  index,
  onToggleExpand,
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma
}) => {
  // Determina se i pulsanti speciali devono essere mostrati
  const canBeCompleted = servizio.stato === 'assegnato';
  const canBeSigned = (servizio.stato === 'assegnato' || servizio.stato === 'completato') && !servizio.firma_url;

  return (
    <>
      <TableRow
        key={servizio.id}
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => onToggleExpand(servizio.id)}
      >
        <TableCell className="font-medium">
          {formatProgressiveId(servizio.id, index)}
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
        <TableCell>
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            {canBeCompleted && onCompleta && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCompleta(servizio);
                }}
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Completa</span>
              </Button>
            )}
            
            {canBeSigned && onFirma && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFirma(servizio);
                }}
              >
                <Clipboard className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Firma</span>
              </Button>
            )}
            
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
                {servizio.stato === 'da_assegnare' && isAdminOrSocio && onSelect && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onSelect(servizio);
                  }}>
                    <Users className="h-4 w-4 mr-2" />
                    Assegna
                  </DropdownMenuItem>
                )}
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
