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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  // Helper per ottenere contanti dai servizi salvati
  const useContantiServizi = (userId: string, mese: number, anno: number, enabled: boolean) => {
    return useQuery({
      queryKey: ['contanti-servizi', userId, mese, anno],
      queryFn: async () => {
        const startDate = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(anno, mese, 0).toISOString().split('T')[0];

        const { data: servizi, error } = await supabase
          .from('servizi')
          .select('incasso_ricevuto, incasso_previsto')
          .eq('assegnato_a', userId)
          .eq('metodo_pagamento', 'Contanti')
          .gte('data_servizio', startDate)
          .lte('data_servizio', endDate)
          .in('stato', ['completato', 'consuntivato']);

        if (error) throw error;

        return servizi?.reduce((sum, s) => 
          sum + (Number(s.incasso_ricevuto) || Number(s.incasso_previsto) || 0), 0
        ) || 0;
      },
      enabled,
      staleTime: 1000 * 60 * 5,
    });
  };

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

  // Wrapper per renderizzare ogni riga
  const StipendioRow = ({ stipendio }: { stipendio: StipendiAutomaticoUtente }) => {
    // Per stipendi salvati, fetch contanti dai servizi
    const mese = stipendio.stipendioEsistente?.mese || 0;
    const anno = stipendio.stipendioEsistente?.anno || 0;
    const { data: contantiServizi } = useContantiServizi(
      stipendio.userId, 
      mese, 
      anno, 
      stipendio.hasStipendioSalvato
    );

    // Calcola entrate e uscite ESATTAMENTE come nella pagina dettaglio
    let entratePositive = 0;
    let usciteTotali = 0;
    
    if (stipendio.hasStipendioSalvato && stipendio.stipendioEsistente) {
      // Per stipendi salvati: usa totale_lordo come compensi servizi
      const riporto = stipendio.stipendioEsistente.riporto_mese_precedente || 0;
      const contanti = contantiServizi || 0;
      
      // ENTRATE = compensi servizi (totale_lordo) + spese personali + riporto positivo
      entratePositive = 
        (stipendio.stipendioEsistente.totale_lordo || 0) +
        (stipendio.stipendioEsistente.totale_spese || 0) +
        (riporto > 0 ? riporto : 0);
      
      // USCITE = prelievi + incassi dipendenti + contanti servizi + riporto negativo
      usciteTotali = 
        (stipendio.stipendioEsistente.totale_prelievi || 0) +
        (stipendio.stipendioEsistente.incassi_da_dipendenti || 0) +
        contanti +
        (riporto < 0 ? Math.abs(riporto) : 0);
    } else if (stipendio.calcoloCompleto) {
      // Per calcoli automatici: usa totaleLordo dal calcolo completo
      const calc = stipendio.calcoloCompleto;
      const detr = calc.detrazioni;
      
      // ENTRATE = compensi servizi (totaleLordo) + spese personali + riporto positivo
      entratePositive = 
        calc.totaleLordo +
        detr.totaleSpesePersonali +
        (detr.riportoMesePrecedente > 0 ? detr.riportoMesePrecedente : 0);
      
      // USCITE = prelievi + incassi dipendenti + contanti servizi + riporto negativo
      usciteTotali = 
        detr.totalePrelievi +
        detr.incassiDaDipendenti +
        detr.incassiServiziContanti +
        (detr.riportoMesePrecedente < 0 ? Math.abs(detr.riportoMesePrecedente) : 0);
    }

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
  };

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
          {stipendi.map((stipendio) => (
            <StipendioRow key={stipendio.userId} stipendio={stipendio} />
          ))}
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
