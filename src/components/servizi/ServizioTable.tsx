
import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, TableIcon, Users, ChevronDown } from "lucide-react";
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getStatoBadge, getUserName } from "./utils/serviceUtils";
import { useAziende } from "@/hooks/useAziende";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

interface ServizioTableProps {
  servizi: Servizio[];
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
  onSelect?: (servizio: Servizio) => void;
  isAdminOrSocio?: boolean;
}

export const ServizioTable = ({ 
  servizi, 
  users, 
  onNavigateToDetail,
  onSelect,
  isAdminOrSocio = false
}: ServizioTableProps) => {
  const { aziende } = useAziende();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [passeggeriCounts, setPasseggeriCounts] = useState<Record<string, number>>({});
  
  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };

  // Fetch passenger counts for services
  useEffect(() => {
    const fetchPasseggeriCounts = async () => {
      if (servizi.length === 0) return;
      
      const servizioIds = servizi.map(s => s.id);
      
      const { data, error } = await supabase
        .from('passeggeri')
        .select('servizio_id')
        .in('servizio_id', servizioIds);
        
      if (error) {
        console.error('Error fetching passengers:', error);
        return;
      }
      
      // Count passengers per service
      const counts: Record<string, number> = {};
      data?.forEach(p => {
        counts[p.servizio_id] = (counts[p.servizio_id] || 0) + 1;
      });
      
      setPasseggeriCounts(counts);
    };
    
    fetchPasseggeriCounts();
  }, [servizi]);

  const toggleRowExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell colSpan={8} className="text-center py-6">
                Nessun servizio disponibile
              </TableCell>
            </TableRow>
          ) : (
            servizi.map((servizio) => (
              <>
                <TableRow 
                  key={servizio.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleRowExpand(servizio.id)}
                >
                  <TableCell className="font-medium">
                    {servizio.numero_commessa || "N/D"}
                  </TableCell>
                  <TableCell>{getAziendaName(servizio.azienda_id)}</TableCell>
                  <TableCell>{format(parseISO(servizio.data_servizio), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{servizio.orario_servizio}</TableCell>
                  <TableCell>{getStatoBadge(servizio.stato)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {passeggeriCounts[servizio.id] || 0}
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
                {expandedRow === servizio.id && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted/30 p-4">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        <div>
                          <span className="font-medium">Referente:</span>{" "}
                          <span>{getUserName(users, servizio.referente_id)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Metodo pagamento:</span>{" "}
                          <span>{servizio.metodo_pagamento}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Indirizzo di presa:</span>{" "}
                          <span>{servizio.indirizzo_presa}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Indirizzo di destinazione:</span>{" "}
                          <span>{servizio.indirizzo_destinazione}</span>
                        </div>
                        {servizio.note && (
                          <div className="col-span-2">
                            <span className="font-medium">Note:</span>{" "}
                            <span>{servizio.note}</span>
                          </div>
                        )}
                        <div className="col-span-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToDetail(servizio.id);
                            }}
                          >
                            Dettagli completi
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
