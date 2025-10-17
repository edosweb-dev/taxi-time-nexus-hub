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
import { Save, Eye, Check } from 'lucide-react';
import { StipendiAutomaticoUtente } from '@/lib/api/stipendi/calcoloAutomaticoStipendi';
import { Skeleton } from '@/components/ui/skeleton';

interface TabellaStipendAutomaticiProps {
  stipendi: StipendiAutomaticoUtente[];
  isLoading: boolean;
  onSalvaStipendio: (stipendio: StipendiAutomaticoUtente) => void;
  onViewDetails: (stipendio: StipendiAutomaticoUtente) => void;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '€0,00';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

const getRoleBadge = (role: string) => {
  const roleConfig = {
    admin: { label: 'Admin', variant: 'default' as const },
    socio: { label: 'Socio', variant: 'secondary' as const },
    dipendente: { label: 'Dipendente', variant: 'outline' as const },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.dipendente;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const getStatoBadge = (stipendio: StipendiAutomaticoUtente) => {
  if (!stipendio.hasStipendioSalvato) {
    return <Badge variant="outline">Da salvare</Badge>;
  }

  const stato = stipendio.stipendioEsistente?.stato;
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

export function TabellaStipendAutomatici({
  stipendi,
  isLoading,
  onSalvaStipendio,
  onViewDetails,
}: TabellaStipendAutomaticiProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (stipendi.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nessun utente trovato per questo mese</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Dipendente</TableHead>
            <TableHead>Ruolo</TableHead>
            <TableHead className="text-right">Servizi</TableHead>
            <TableHead className="text-right">KM</TableHead>
            <TableHead className="text-right">Ore Attesa</TableHead>
            <TableHead className="text-right">Totale Lordo</TableHead>
            <TableHead className="text-right">Totale Netto</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stipendi.map((stipendio) => {
            const totLordo = stipendio.hasStipendioSalvato
              ? stipendio.stipendioEsistente.totale_lordo
              : stipendio.calcoloCompleto?.totaleLordo || 0;

            const totNetto = stipendio.hasStipendioSalvato
              ? stipendio.stipendioEsistente.totale_netto
              : stipendio.calcoloCompleto?.totaleNetto || 0;

            const hasCalcoloValido = stipendio.numeroServizi > 0 || stipendio.hasStipendioSalvato;

            return (
              <TableRow
                key={stipendio.userId}
                className={!hasCalcoloValido ? 'opacity-50' : ''}
              >
                <TableCell className="font-medium">
                  {stipendio.firstName} {stipendio.lastName}
                </TableCell>
                <TableCell>{getRoleBadge(stipendio.role)}</TableCell>
                <TableCell className="text-right">
                  {stipendio.numeroServizi || '-'}
                </TableCell>
                <TableCell className="text-right">
                  {stipendio.kmTotali > 0 ? stipendio.kmTotali.toFixed(0) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {stipendio.oreAttesa > 0 ? stipendio.oreAttesa.toFixed(1) : '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {hasCalcoloValido ? formatCurrency(totLordo) : '-'}
                </TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  {hasCalcoloValido ? formatCurrency(totNetto) : '-'}
                </TableCell>
                <TableCell>{getStatoBadge(stipendio)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {hasCalcoloValido && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(stipendio)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!stipendio.hasStipendioSalvato && stipendio.calcoloCompleto && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onSalvaStipendio(stipendio)}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Salva
                          </Button>
                        )}
                        {stipendio.hasStipendioSalvato && stipendio.stipendioEsistente?.stato === 'bozza' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {/* Conferma */}}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Conferma
                          </Button>
                        )}
                      </>
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
