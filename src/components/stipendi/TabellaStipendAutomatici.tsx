import React, { useState, useMemo } from 'react';
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
import { Save, Eye, CheckCircle, Clock, CheckCircle2, Loader2, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { StipendiAutomaticoUtente } from '@/lib/api/stipendi/calcoloAutomaticoStipendi';
import { Skeleton } from '@/components/ui/skeleton';
import { DialogConfermaStipendio } from './DialogConfermaStipendio';
import { useConfermaStipendio } from '@/hooks/useStipendi';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ricalcolaESalvaStipendio } from '@/lib/api/stipendi/ricalcolaStipendio';
import { toast } from '@/components/ui/sonner';

interface TabellaStipendAutomaticiProps {
  stipendi: StipendiAutomaticoUtente[];
  isLoading: boolean;
  onSalvaStipendio: (stipendio: StipendiAutomaticoUtente) => void;
  onViewDetails: (stipendio: StipendiAutomaticoUtente) => void;
  mese?: number;
  anno?: number;
}

type SortKey = 'nome' | 'servizi' | 'km' | 'netto' | null;
type SortDirection = 'asc' | 'desc';

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
      label: 'Bozza',
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

// Funzione per calcolare il netto di uno stipendio
const calcolaNetto = (stipendio: StipendiAutomaticoUtente): number => {
  if (!stipendio.calcoloCompleto) return 0;
  
  const calc = stipendio.calcoloCompleto;
  const detr = calc.detrazioni;
  
  const entratePositive = 
    calc.totaleLordo +
    detr.totaleSpesePersonali +
    detr.totaleVersamenti +
    (detr.riportoMesePrecedente > 0 ? detr.riportoMesePrecedente : 0);
  
  const usciteTotali = 
    detr.totalePrelievi +
    detr.incassiDaDipendenti +
    detr.incassiServiziContanti +
    (detr.riportoMesePrecedente < 0 ? Math.abs(detr.riportoMesePrecedente) : 0);
  
  return entratePositive - usciteTotali;
};

export function TabellaStipendAutomatici({
  stipendi,
  isLoading,
  onSalvaStipendio,
  onViewDetails,
  mese,
  anno,
}: TabellaStipendAutomaticiProps) {
  const [confermaDialogStipendio, setConfermaDialogStipendio] = useState<any>(null);
  const [recalculatingUserId, setRecalculatingUserId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const confermaStipendioMutation = useConfermaStipendio();
  const queryClient = useQueryClient();

  // Ordinamento
  const sortedStipendi = useMemo(() => {
    if (!sortKey) return stipendi;
    
    return [...stipendi].sort((a, b) => {
      let comparison = 0;
      
      switch (sortKey) {
        case 'nome':
          const nomeA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nomeB = `${b.firstName} ${b.lastName}`.toLowerCase();
          comparison = nomeA.localeCompare(nomeB);
          break;
        case 'servizi':
          comparison = (a.numeroServizi || 0) - (b.numeroServizi || 0);
          break;
        case 'km':
          comparison = (a.kmTotali || 0) - (b.kmTotali || 0);
          break;
        case 'netto':
          comparison = calcolaNetto(a) - calcolaNetto(b);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [stipendi, sortKey, sortDirection]);

  // Toggle ordinamento
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        // Reset
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Icona ordinamento
  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  };

  // Handler per ricalcolo singolo stipendio
  const handleRicalcola = async (stipendio: StipendiAutomaticoUtente) => {
    if (!mese || !anno) {
      toast.error('Mese o anno non specificati');
      return;
    }

    setRecalculatingUserId(stipendio.userId);
    try {
      const result = await ricalcolaESalvaStipendio(stipendio.userId, mese, anno);
      
      if (result.success) {
        toast.success(`Stipendio ricalcolato: €${result.totaleNetto?.toFixed(2)}`);
        queryClient.invalidateQueries({ queryKey: ['stipendi-automatici'] });
        queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      } else {
        toast.error(result.error || 'Errore durante il ricalcolo');
      }
    } catch (error) {
      console.error('[handleRicalcola] Error:', error);
      toast.error('Errore durante il ricalcolo dello stipendio');
    } finally {
      setRecalculatingUserId(null);
    }
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
    // SEMPRE usare calcoloCompleto se disponibile (calcolato on-the-fly)
    let entratePositive = 0;
    let usciteTotali = 0;
    let incassiPersonali = 0;
    
    if (stipendio.calcoloCompleto) {
      const calc = stipendio.calcoloCompleto;
      const detr = calc.detrazioni;
      
      // ENTRATE = lordo + spese personali + versamenti + riporto positivo
      entratePositive = 
        calc.totaleLordo +
        detr.totaleSpesePersonali +
        detr.totaleVersamenti +
        (detr.riportoMesePrecedente > 0 ? detr.riportoMesePrecedente : 0);
      
      // USCITE = prelievi + incassi dipendenti + contanti servizi + riporto negativo
      usciteTotali = 
        detr.totalePrelievi +
        detr.incassiDaDipendenti +
        detr.incassiServiziContanti +
        (detr.riportoMesePrecedente < 0 ? Math.abs(detr.riportoMesePrecedente) : 0);
      
      // Incassi personali = contanti incassati dai servizi
      incassiPersonali = detr.incassiServiziContanti || 0;
    }

    // Calcolo diretto: Netto = Entrate - Uscite
    const totNetto = entratePositive - usciteTotali;
    const isNegativo = totNetto < 0;

    const hasCalcoloValido = stipendio.numeroServizi > 0 || stipendio.hasStipendioSalvato;

    // Formattazione compatta per mobile
    const kmFormatted = stipendio.kmTotali ? new Intl.NumberFormat('it-IT').format(stipendio.kmTotali) : '0';
    const oreFormatted = stipendio.oreAttesa ? `${stipendio.oreAttesa}h` : '0h';

    return (
      <TableRow
        key={stipendio.userId}
        className={cn(
          !hasCalcoloValido && 'opacity-50',
          isNegativo && hasCalcoloValido && 'bg-red-50/50 dark:bg-red-950/20'
        )}
      >
        <TableCell className="font-medium">
          <div className="flex flex-col">
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
            {/* Riga compatta su mobile con metriche */}
            <span className="text-xs text-muted-foreground md:hidden mt-0.5">
              {stipendio.numeroServizi || 0} serv. • {kmFormatted} km • {oreFormatted}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-right hidden md:table-cell">
          {stipendio.numeroServizi || '-'}
        </TableCell>
        <TableCell className="text-right hidden md:table-cell">
          {stipendio.kmTotali ? new Intl.NumberFormat('it-IT').format(stipendio.kmTotali) : '-'}
        </TableCell>
        <TableCell className="text-right hidden md:table-cell">
          {stipendio.oreAttesa ? `${stipendio.oreAttesa}h` : '-'}
        </TableCell>
        <TableCell className="text-right font-medium text-primary">
          {hasCalcoloValido ? formatCurrency(entratePositive) : '-'}
        </TableCell>
        <TableCell className="text-right font-medium text-destructive">
          {hasCalcoloValido ? formatCurrency(usciteTotali) : '-'}
        </TableCell>
        <TableCell className="text-right hidden lg:table-cell text-orange-600">
          {hasCalcoloValido ? formatCurrency(incassiPersonali) : '-'}
        </TableCell>
        <TableCell className={cn(
          "text-right font-semibold",
          isNegativo && hasCalcoloValido && "text-red-600"
        )}>
          {hasCalcoloValido ? (
            <span className="inline-flex items-center gap-1">
              {isNegativo && <AlertTriangle className="h-3.5 w-3.5" />}
              {formatCurrency(totNetto)}
            </span>
          ) : '-'}
        </TableCell>
        <TableCell className="hidden sm:table-cell">{getStatoBadge(stipendio)}</TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            {hasCalcoloValido && (
              <>
                {/* Pulsante Ricalcola - solo per stipendi salvati in bozza */}
                {stipendio.hasStipendioSalvato && stipendio.stipendioEsistente?.stato === 'bozza' && mese && anno && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRicalcola(stipendio)}
                    disabled={recalculatingUserId === stipendio.userId}
                    title="Ricalcola stipendio"
                  >
                    {recalculatingUserId === stipendio.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                )}
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('nome')}
            >
              <span className="inline-flex items-center">
                Nome
                <SortIcon columnKey="nome" />
              </span>
            </TableHead>
            <TableHead 
              className="text-right hidden md:table-cell cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('servizi')}
            >
              <span className="inline-flex items-center justify-end w-full">
                Servizi
                <SortIcon columnKey="servizi" />
              </span>
            </TableHead>
            <TableHead 
              className="text-right hidden md:table-cell cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('km')}
            >
              <span className="inline-flex items-center justify-end w-full">
                KM
                <SortIcon columnKey="km" />
              </span>
            </TableHead>
            <TableHead className="text-right hidden md:table-cell">Ore</TableHead>
            <TableHead className="text-right">Entrate</TableHead>
            <TableHead className="text-right">Uscite</TableHead>
            <TableHead className="text-right hidden lg:table-cell">Incassi Pers.</TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('netto')}
            >
              <span className="inline-flex items-center justify-end w-full">
                Netto
                <SortIcon columnKey="netto" />
              </span>
            </TableHead>
            <TableHead className="hidden sm:table-cell">Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStipendi.map((stipendio) => (
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
