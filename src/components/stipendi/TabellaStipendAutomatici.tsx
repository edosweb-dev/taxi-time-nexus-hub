import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Save, Eye, CheckCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { StipendiAutomaticoUtente } from '@/lib/api/stipendi/calcoloAutomaticoStipendi';
import { Skeleton } from '@/components/ui/skeleton';
import { DialogConfermaStipendio } from './DialogConfermaStipendio';
import { useConfermaStipendio } from '@/hooks/useStipendi';
import { cn } from '@/lib/utils';

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
  const config = {
    'bozza': {
      icon: Clock,
      label: 'Bozza (Auto-calcolato)',
      className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
    },
    'confermato': {
      icon: CheckCircle,
      label: 'Confermato',
      className: 'bg-blue-500/10 text-blue-700 border-blue-500/20'
    },
    'pagato': {
      icon: CheckCircle2,
      label: 'Pagato',
      className: 'bg-green-500/10 text-green-700 border-green-500/20'
    }
  };

  const cfg = config[stato as keyof typeof config];
  if (!cfg) return <Badge variant="outline">-</Badge>;

  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn('gap-1', cfg.className)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
};

export function TabellaStipendAutomatici({
  stipendi,
  isLoading,
  onSalvaStipendio,
  onViewDetails,
}: TabellaStipendAutomaticiProps) {
  const [confermaDialogStipendio, setConfermaDialogStipendio] = useState<any>(null);
  const confermaStipendioMutation = useConfermaStipendio();

  const handleConferma = (stipendio: StipendiAutomaticoUtente) => {
    if (stipendio.stipendioEsistente) {
      setConfermaDialogStipendio(stipendio.stipendioEsistente);
    }
  };

  const handleConfirmDialog = (stipendioId: string) => {
    confermaStipendioMutation.mutate(stipendioId);
    setConfermaDialogStipendio(null);
  };

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
            <TableHead>Nome e Cognome</TableHead>
            <TableHead className="text-right">Nr servizi</TableHead>
            <TableHead className="text-right">Entrate totali</TableHead>
            <TableHead className="text-right">Uscite totali</TableHead>
            <TableHead className="text-right">Stipendio netto</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stipendi.map((stipendio) => {
            // Calcola entrate totali (compensi KM + compensi Ore + spese personali + riporto positivo)
            const compensiKm = stipendio.hasStipendioSalvato
              ? (stipendio.stipendioEsistente.base_calcolo || 0) * (stipendio.stipendioEsistente.coefficiente_applicato || 1)
              : (stipendio.calcoloCompleto?.baseConAumento || 0);
            
            const compensiOre = stipendio.hasStipendioSalvato
              ? ((stipendio.stipendioEsistente.totale_ore_attesa || 0) * 15) // tariffa oraria default
              : (stipendio.calcoloCompleto?.importoOreAttesa || 0);
            
            const spesePersonali = stipendio.hasStipendioSalvato
              ? (stipendio.stipendioEsistente.totale_spese || 0)
              : 0;
            
            const riporto = stipendio.hasStipendioSalvato
              ? (stipendio.stipendioEsistente.riporto_mese_precedente || 0)
              : 0;
            
            const entratePositive = compensiKm + compensiOre + spesePersonali + (riporto > 0 ? riporto : 0);
            
            // Calcola uscite totali (prelievi + incassi dipendenti + contanti + riporto negativo)
            const prelievi = stipendio.hasStipendioSalvato
              ? (stipendio.stipendioEsistente.totale_prelievi || 0)
              : 0;
            
            const incassiDipendenti = stipendio.hasStipendioSalvato
              ? (stipendio.stipendioEsistente.incassi_da_dipendenti || 0)
              : 0;
            
            const usciteTotali = prelievi + incassiDipendenti + (riporto < 0 ? Math.abs(riporto) : 0);

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
                  {stipendio.role === 'admin' || stipendio.role === 'socio' ? (
                    <Link 
                      to={`/utenti/${stipendio.userId}/stipendio`}
                      className="text-primary hover:underline font-medium"
                    >
                      {stipendio.firstName} {stipendio.lastName}
                    </Link>
                  ) : (
                    <span>{stipendio.firstName} {stipendio.lastName}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {stipendio.numeroServizi || '-'}
                </TableCell>
                <TableCell className="text-right font-medium text-primary">
                  {hasCalcoloValido ? formatCurrency(entratePositive) : '-'}
                </TableCell>
                <TableCell className="text-right font-medium text-destructive">
                  {hasCalcoloValido ? formatCurrency(usciteTotali) : '-'}
                </TableCell>
                <TableCell className="text-right font-semibold">
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
                            variant="default"
                            size="sm"
                            onClick={() => handleConferma(stipendio)}
                            disabled={confermaStipendioMutation.isPending}
                          >
                            {confermaStipendioMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            )}
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

      <DialogConfermaStipendio
        open={!!confermaDialogStipendio}
        onOpenChange={(open) => !open && setConfermaDialogStipendio(null)}
        stipendio={confermaDialogStipendio}
        onConfirm={handleConfirmDialog}
      />
    </div>
  );
}
