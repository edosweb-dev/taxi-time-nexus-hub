
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { MovimentoAziendale, MovimentoStato } from "@/lib/types/spese";
import { MovimentoDetailDialog } from "./MovimentoDetailDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MovimentiListProps {
  movimenti: MovimentoAziendale[];
  isLoading: boolean;
  showActions?: boolean;
  onChangeStato?: (id: string, stato: MovimentoStato) => void;
}

export function MovimentiList({
  movimenti,
  isLoading,
  showActions = false,
  onChangeStato,
}: MovimentiListProps) {
  const [selectedMovimento, setSelectedMovimento] = useState<string | null>(null);

  const getDetailMovimento = () => {
    if (!selectedMovimento) return null;
    return movimenti.find((movimento) => movimento.id === selectedMovimento) || null;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getTipoStyle = (tipo: string) => {
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Causale</TableHead>
              <TableHead>Importo</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Effettuato da</TableHead>
              {showActions && <TableHead>Azioni</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Caricamento movimenti...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : movimenti.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Nessun movimento trovato
                </TableCell>
              </TableRow>
            ) : (
              movimenti.map((movimento) => (
                <TableRow key={movimento.id}>
                  <TableCell>
                    {format(new Date(movimento.data), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className={getTipoStyle(movimento.tipo)}>
                      {movimento.tipo.charAt(0).toUpperCase() + movimento.tipo.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal"
                      onClick={() => setSelectedMovimento(movimento.id)}
                    >
                      {movimento.causale}
                    </Button>
                  </TableCell>
                  <TableCell className={getTipoStyle(movimento.tipo)}>
                    {formatAmount(movimento.importo)}
                  </TableCell>
                  <TableCell>
                    {movimento.stato === "saldato" ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Saldato
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Da saldare
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {movimento.effettuato_da ? (
                      `${movimento.effettuato_da.first_name} ${movimento.effettuato_da.last_name}`
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  {showActions && onChangeStato && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Azioni
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {movimento.stato === "pending" && (
                            <DropdownMenuItem
                              onClick={() => onChangeStato(movimento.id, "saldato")}
                            >
                              Segna come saldato
                            </DropdownMenuItem>
                          )}
                          {movimento.stato === "saldato" && (
                            <DropdownMenuItem
                              onClick={() => onChangeStato(movimento.id, "pending")}
                            >
                              Segna come da saldare
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedMovimento && getDetailMovimento() && (
        <MovimentoDetailDialog
          movimento={getDetailMovimento()!}
          open={!!selectedMovimento}
          onOpenChange={(open) => !open && setSelectedMovimento(null)}
        />
      )}
    </>
  );
}
