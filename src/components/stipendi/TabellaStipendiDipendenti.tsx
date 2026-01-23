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
import { Eye, Clock, Briefcase } from 'lucide-react';
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

const formatOre = (ore: number) => {
  if (ore === 0) return '0h';
  // Arrotonda a 1 decimale
  const oreFormatted = ore % 1 === 0 ? ore.toString() : ore.toFixed(1);
  return `${oreFormatted}h`;
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
            <TableHead className="text-center hidden md:table-cell">Servizi</TableHead>
            <TableHead className="text-center hidden md:table-cell">Ore Lav.</TableHead>
            <TableHead className="text-center hidden md:table-cell">Ore Fatt.</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Stip. Fisso</TableHead>
            <TableHead className="text-right hidden lg:table-cell">Lordo</TableHead>
            <TableHead className="text-right">Netto</TableHead>
            <TableHead className="hidden sm:table-cell">Stato</TableHead>
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
                className={!dipendente.hasStipendioSalvato ? 'opacity-60' : ''}
              >
                {/* Nome + info mobile */}
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{dipendente.firstName} {dipendente.lastName}</span>
                    {/* Info compatta per mobile */}
                    <span className="text-xs text-muted-foreground md:hidden flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <Briefcase className="h-3 w-3" />
                        {dipendente.numeroServizi}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {formatOre(dipendente.oreLavorate)} lav.
                      </span>
                      <span>•</span>
                      <span>{formatOre(dipendente.oreFatturate)} fatt.</span>
                    </span>
                  </div>
                </TableCell>
                
                {/* Servizi - solo desktop */}
                <TableCell className="text-center hidden md:table-cell">
                  <span className="font-medium">{dipendente.numeroServizi}</span>
                </TableCell>
                
                {/* Ore Lavorate - solo desktop */}
                <TableCell className="text-center hidden md:table-cell">
                  <span className="text-muted-foreground">{formatOre(dipendente.oreLavorate)}</span>
                </TableCell>
                
                {/* Ore Fatturate - solo desktop */}
                <TableCell className="text-center hidden md:table-cell">
                  <span className="text-muted-foreground">{formatOre(dipendente.oreFatturate)}</span>
                </TableCell>
                
                {/* Stipendio Fisso */}
                <TableCell className="text-right hidden sm:table-cell">
                  {formatCurrency(dipendente.stipendioFisso)}
                </TableCell>
                
                {/* Lordo */}
                <TableCell className="text-right font-medium hidden lg:table-cell">
                  {dipendente.hasStipendioSalvato ? formatCurrency(totLordo) : '-'}
                </TableCell>
                
                {/* Netto */}
                <TableCell className="text-right font-semibold text-primary">
                  {dipendente.hasStipendioSalvato ? formatCurrency(totNetto) : '-'}
                </TableCell>
                
                {/* Stato */}
                <TableCell className="hidden sm:table-cell">{getStatoBadge(dipendente)}</TableCell>
                
                {/* Azioni */}
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
