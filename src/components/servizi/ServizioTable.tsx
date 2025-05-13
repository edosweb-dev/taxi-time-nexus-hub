
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { useAziende } from "@/hooks/useAziende";
import { usePasseggeriCounts } from "./hooks/usePasseggeriCounts";
import { ServizioTableRow } from "./ServizioTableRow";

interface ServizioTableProps {
  servizi: Servizio[];
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void;
  onCompleta?: (servizio: Servizio) => void; // Nuovo handler per completamento
  onFirma?: (servizio: Servizio) => void; // Nuovo handler per firma
  isAdminOrSocio?: boolean;
}

export const ServizioTable = ({ 
  servizi, 
  users, 
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma,
  isAdminOrSocio = false
}: ServizioTableProps) => {
  const { aziende } = useAziende();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const { passeggeriCounts } = usePasseggeriCounts(servizi);
  
  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Commessa</TableHead>
            <TableHead>Azienda</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Orario</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Passeggeri</TableHead>
            <TableHead>Assegnato a</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {servizi.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                Nessun servizio disponibile
              </TableCell>
            </TableRow>
          ) : (
            servizi.map((servizio, index) => (
              <ServizioTableRow
                key={servizio.id}
                servizio={servizio}
                users={users}
                aziendaName={getAziendaName(servizio.azienda_id)}
                passengerCount={passeggeriCounts[servizio.id] || 0}
                isExpanded={expandedRow === servizio.id}
                isAdminOrSocio={isAdminOrSocio}
                index={index}
                onToggleExpand={toggleRowExpand}
                onNavigateToDetail={onNavigateToDetail}
                onSelect={onSelect}
                onCompleta={onCompleta}
                onFirma={onFirma}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
