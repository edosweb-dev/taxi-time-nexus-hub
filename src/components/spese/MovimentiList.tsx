
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleDollarSignIcon,
  Euro,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { MovimentoAziendale, MovimentoTipo } from "@/lib/types/spese";
import { MovimentoDetailDialog } from "./MovimentoDetailDialog";

interface MovimentiListProps {
  movimenti: MovimentoAziendale[];
  isLoading?: boolean;
  showActions?: boolean;
  onChangeStato?: (id: string, stato: "saldato" | "pending") => void;
}

export function MovimentiList({
  movimenti,
  isLoading = false,
  showActions = true,
  onChangeStato,
}: MovimentiListProps) {
  const [selectedMovimento, setSelectedMovimento] = useState<MovimentoAziendale | null>(null);

  const handleViewDetail = (movimento: MovimentoAziendale) => {
    setSelectedMovimento(movimento);
  };

  const closeDetailDialog = () => {
    setSelectedMovimento(null);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getTipoIcon = (tipo: MovimentoTipo) => {
    switch (tipo) {
      case "spesa":
        return <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />;
      case "incasso":
        return <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />;
      case "prelievo":
        return <CircleDollarSignIcon className="h-4 w-4 text-orange-500 mr-1" />;
      default:
        return null;
    }
  };

  const getTipoColor = (tipo: MovimentoTipo) => {
    switch (tipo) {
      case "spesa":
        return "text-red-500";
      case "incasso":
        return "text-green-500";
      case "prelievo":
        return "text-orange-500";
      default:
        return "";
    }
  };

  const getStatoBadge = (stato?: string | null) => {
    if (stato === "saldato") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Saldato
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          Da saldare
        </Badge>
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Movimenti Aziendali</CardTitle>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Esporta
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <p>Caricamento...</p>
          </div>
        ) : movimenti.length === 0 ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium">Nessun movimento registrato</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Non ci sono movimenti aziendali registrati.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Causale</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Utente</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimenti.map((movimento) => (
                  <TableRow key={movimento.id}>
                    <TableCell>{format(new Date(movimento.data), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getTipoIcon(movimento.tipo)}
                        <span className={getTipoColor(movimento.tipo)}>
                          {movimento.tipo.charAt(0).toUpperCase() + movimento.tipo.slice(1)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className={getTipoColor(movimento.tipo)}>
                          {formatAmount(movimento.importo)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={movimento.causale}>
                      {movimento.causale}
                    </TableCell>
                    <TableCell>{movimento.metodo_pagamento?.nome || "-"}</TableCell>
                    <TableCell>
                      {movimento.effettuato_da
                        ? `${movimento.effettuato_da.first_name} ${movimento.effettuato_da.last_name}`
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatoBadge(movimento.stato)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(movimento)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {showActions && onChangeStato && movimento.stato && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onChangeStato(
                                movimento.id,
                                movimento.stato === "saldato" ? "pending" : "saldato"
                              )
                            }
                          >
                            {movimento.stato === "saldato" ? "Marca da saldare" : "Segna saldato"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedMovimento && (
        <MovimentoDetailDialog
          movimento={selectedMovimento}
          open={!!selectedMovimento}
          onOpenChange={closeDetailDialog}
        />
      )}
    </Card>
  );
}
