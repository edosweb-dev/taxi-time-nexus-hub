
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Info, MapPin, Calendar, Clock, CreditCard, User, Building, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getStatoBadge, getUserName } from "./utils/serviceUtils";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { useNavigate } from "react-router-dom";

interface ServizioTableProps {
  servizi: Servizio[];
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void; 
  isAdminOrSocio?: boolean;
}

export function ServizioTable({
  servizi,
  users,
  onNavigateToDetail,
  onSelect,
  isAdminOrSocio = false
}: ServizioTableProps) {
  const navigate = useNavigate();

  if (servizi.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/20 rounded-lg">
        <p>Nessun servizio disponibile in questa categoria</p>
      </div>
    );
  }

  const handleSelect = (servizio: Servizio) => {
    if (onSelect) onSelect(servizio);
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Indirizzo di presa</TableHead>
            <TableHead>Indirizzo di destinazione</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Assegnato a</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servizi.map((servizio) => {
            const assignedUserName = getUserName(users, servizio.assegnato_a);
            
            return (
              <TableRow key={servizio.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(servizio.data_servizio)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    {servizio.orario_servizio.substring(0, 5)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {servizio.azienda_id}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {servizio.indirizzo_presa}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {servizio.indirizzo_destinazione}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatoBadge(servizio.stato)}
                </TableCell>
                <TableCell>
                  {servizio.conducente_esterno 
                    ? <span className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {servizio.conducente_esterno_nome || 'Conducente esterno'}
                      </span> 
                    : assignedUserName 
                      ? <span className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {assignedUserName}
                        </span>
                      : <span className="text-muted-foreground text-sm">Non assegnato</span>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onNavigateToDetail(servizio.id)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Dettagli
                    </Button>
                    {isAdminOrSocio && servizio.stato === 'da_assegnare' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSelect(servizio)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Assegna
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
