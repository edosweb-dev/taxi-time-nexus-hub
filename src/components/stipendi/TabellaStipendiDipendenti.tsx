import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { StipendioManualeDipendente } from '@/lib/api/stipendi/getStipendiDipendenti';
import { Skeleton } from '@/components/ui/skeleton';

interface TabellaStipendiDipendentiProps {
  dipendenti: StipendioManualeDipendente[];
  isLoading: boolean;
  onViewDetails: (dipendente: StipendioManualeDipendente) => void;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '€0,00';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

const getStatoBadge = (dipendente: StipendioManualeDipendente) => {
  if (!dipendente.hasStipendioSalvato) {
    return <Badge variant="outline">Non creato</Badge>;
  }

  const stato = dipendente.stipendioSalvato?.stato;
  switch (stato) {
    case 'bozza':
      return <Badge variant="outline">Bozza</Badge>;
    case 'confermato':
      return <Badge variant="default">Confermato</Badge>;
    case 'pagato':
      return <Badge variant="secondary">Pagato</Badge>;
    default:
      return <Badge variant="outline">-</Badge>;
  }
};

export function TabellaStipendiDipendenti({
  dipendenti,
  isLoading,
  onViewDetails,
}: TabellaStipendiDipendentiProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (dipendenti.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nessun dipendente trovato</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dipendente</TableHead>
            <TableHead className="text-right">Stipendio Fisso</TableHead>
            <TableHead className="text-right">Totale Lordo</TableHead>
            <TableHead className="text-right">Totale Netto</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dipendenti.map((dipendente) => {
            const totLordo = dipendente.stipendioSalvato?.totale_lordo || 0;
            const totNetto = dipendente.stipendioSalvato?.totale_netto || 0;

            return (
              <TableRow
                key={dipendente.userId}
                className={!dipendente.hasStipendioSalvato ? 'opacity-50' : ''}
              >
                <TableCell className="font-medium">
                  {dipendente.firstName} {dipendente.lastName}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(dipendente.stipendioFisso)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {dipendente.hasStipendioSalvato ? formatCurrency(totLordo) : '-'}
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {dipendente.hasStipendioSalvato ? formatCurrency(totNetto) : '-'}
                </TableCell>
                <TableCell>{getStatoBadge(dipendente)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {dipendente.hasStipendioSalvato && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(dipendente)}
                      >
                        <Eye className="h-4 w-4" />
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
