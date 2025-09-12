
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { useAziende } from "@/hooks/useAziende";
import { usePasseggeriCounts } from "./hooks/usePasseggeriCounts";
import { ServizioTableRow } from "./ServizioTableRow";
import { getServizioIndex } from "./utils/formatUtils";

interface ServizioTableProps {
  servizi: Servizio[];
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void;
  onCompleta?: (servizio: Servizio) => void;
  onFirma?: (servizio: Servizio) => void;
  isAdminOrSocio?: boolean;
  allServizi: Servizio[]; // Added this prop for global indexing
}

export const ServizioTable = ({ 
  servizi, 
  users, 
  onNavigateToDetail,
  onSelect,
  onCompleta,
  onFirma,
  isAdminOrSocio = false,
  allServizi
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
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <Table className="w-full">
          <TableHeader className="sticky top-0 bg-background z-10">
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
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <p className="text-lg">Nessun servizio disponibile</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              servizi.map((servizio) => {
                return (
                  <ServizioTableRow
                    key={servizio.id}
                    servizio={servizio}
                    users={users}
                    aziendaName={getAziendaName(servizio.azienda_id)}
                    passengerCount={passeggeriCounts[servizio.id] || 0}
                    isExpanded={expandedRow === servizio.id}
                    isAdminOrSocio={isAdminOrSocio}
                    allServizi={allServizi}
                    onToggleExpand={toggleRowExpand}
                    onNavigateToDetail={onNavigateToDetail}
                    onSelect={onSelect}
                    onCompleta={onCompleta}
                    onFirma={onFirma}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
