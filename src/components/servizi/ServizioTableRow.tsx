
import React from "react";
import { format, parseISO } from "date-fns";
import { Users, ChevronDown } from "lucide-react";
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

interface ServizioTableRowProps {
  servizio: Servizio;
  users: Profile[];
  aziendaName: string;
  passengerCount: number;
  isExpanded: boolean;
  isAdminOrSocio: boolean;
  onToggleExpand: (id: string) => void;
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void;
}

export const ServizioTableRow: React.FC<ServizioTableRowProps> = ({
  servizio,
  users,
  aziendaName,
  passengerCount,
  isExpanded,
  isAdminOrSocio,
  onToggleExpand,
  onNavigateToDetail,
  onSelect
}) => {
  return (
    <>
      <TableRow 
        key={servizio.id}
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => onToggleExpand(servizio.id)}
      >
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
        <TableCell className="text-right">
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
                Visualizza dettagli
              </DropdownMenuItem>
              {servizio.stato === 'da_assegnare' && isAdminOrSocio && onSelect && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onSelect(servizio);
                }}>
                  Assegna
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
