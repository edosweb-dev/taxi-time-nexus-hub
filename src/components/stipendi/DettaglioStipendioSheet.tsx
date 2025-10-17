import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, TrendingUp, Calculator, Banknote, Clock, Navigation } from 'lucide-react';
import { StipendiAutomaticoUtente } from '@/lib/api/stipendi/calcoloAutomaticoStipendi';
import { StipendioManualeDipendente } from '@/lib/api/stipendi/getStipendiDipendenti';

interface DettaglioStipendioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stipendio: StipendiAutomaticoUtente | StipendioManualeDipendente | null;
  tipo: 'socio' | 'dipendente';
  mese: number;
  anno: number;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '€0,00';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

const formatNumber = (value: number | null | undefined, decimals = 2) => {
  if (value === null || value === undefined) return '0';
  return value.toFixed(decimals);
};

const getMonthName = (month: number): string => {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return months[month - 1] || '';
};

const getStatoBadge = (stato: string | undefined) => {
  switch (stato) {
    case 'bozza':
      return <Badge variant="outline">Bozza</Badge>;
    case 'confermato':
      return <Badge variant="default">Confermato</Badge>;
    case 'pagato':
      return <Badge variant="secondary">Pagato</Badge>;
    default:
      return <Badge variant="outline">Non salvato</Badge>;
  }
};

export function DettaglioStipendioSheet({
  open,
  onOpenChange,
  stipendio,
  tipo,
  mese,
  anno,
}: DettaglioStipendioSheetProps) {
  if (!stipendio) return null;

  const isSocio = tipo === 'socio';
  const isDipendente = tipo === 'dipendente';

  // Type guards
  const stipendioSocio = isSocio ? (stipendio as StipendiAutomaticoUtente) : null;
  const stipendioDipendente = isDipendente ? (stipendio as StipendioManualeDipendente) : null;

  const nomeCompleto = `${stipendio.firstName} ${stipendio.lastName}`;
  
  let stato = undefined;
  if (isSocio && stipendioSocio?.hasStipendioSalvato) {
    stato = stipendioSocio.stipendioEsistente?.stato;
  } else if (isDipendente && stipendioDipendente?.hasStipendioSalvato) {
    stato = stipendioDipendente.stipendioSalvato?.stato;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dettaglio Stipendio
          </SheetTitle>
          <SheetDescription>
            {nomeCompleto} - {getMonthName(mese)} {anno}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Informazioni generali */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>Periodo</span>
              </div>
              <span className="font-medium">{getMonthName(mese)} {anno}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ruolo</span>
              <Badge variant={isSocio ? 'default' : 'outline'}>
                {isSocio ? (stipendioSocio?.role === 'admin' ? 'Admin' : 'Socio') : 'Dipendente'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stato</span>
              {getStatoBadge(stato)}
            </div>
          </div>

          <Separator />

          {/* Dettagli calcolo SOCI */}
          {isSocio && stipendioSocio && (
            <>
              {/* Dati servizi */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Dati Servizi
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Servizi eseguiti</span>
                    <p className="text-lg font-semibold">{stipendioSocio.numeroServizi || 0}</p>
                  </div>

                  <div className="space-y-1 flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Totale KM</span>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <Navigation className="h-4 w-4" />
                      {formatNumber(stipendioSocio.kmTotali, 0)} km
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Ore attesa</span>
                    <p className="text-lg font-semibold flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatNumber(stipendioSocio.oreAttesa, 1)} h
                    </p>
                  </div>
                </div>
              </div>

              {stipendioSocio.calcoloCompleto && (
                <>
                  <Separator />

                  {/* Dettaglio calcolo */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Dettaglio Calcolo
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modalità calcolo</span>
                        <Badge variant="outline">
                          {stipendioSocio.calcoloCompleto.dettaglioCalcolo.modalitaCalcolo === 'tabella' ? 'Tabella KM' : 'Lineare'}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">KM totali</span>
                        <span className="font-medium">{formatNumber(stipendioSocio.calcoloCompleto.dettaglioCalcolo.parametriInput.km, 0)} km</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base KM</span>
                        <span className="font-medium">{formatCurrency(stipendioSocio.calcoloCompleto.baseKm)}</span>
                      </div>

                      {stipendioSocio.calcoloCompleto.dettaglioCalcolo.parametriInput.coefficiente > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Coefficiente aumento</span>
                            <span className="font-medium text-green-600">+{formatNumber(stipendioSocio.calcoloCompleto.dettaglioCalcolo.parametriInput.coefficiente, 2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Base con aumento</span>
                            <span className="font-medium text-green-600">{formatCurrency(stipendioSocio.calcoloCompleto.baseConAumento)}</span>
                          </div>
                        </>
                      )}

                      {stipendioSocio.oreAttesa > 0 && (
                        <>
                          <Separator className="my-2" />
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ore attesa</span>
                            <span className="font-medium">{formatNumber(stipendioSocio.oreAttesa, 1)} h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tariffa oraria attesa</span>
                            <span className="font-medium">{formatCurrency(stipendioSocio.calcoloCompleto.dettaglioCalcolo.parametriInput.tariffaOraria)}/h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Importo ore attesa</span>
                            <span className="font-medium">{formatCurrency(stipendioSocio.calcoloCompleto.importoOreAttesa)}</span>
                          </div>
                        </>
                      )}

                      {stipendioSocio.calcoloCompleto.dettaglioCalcolo.dettaglio && (
                        <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                          {stipendioSocio.calcoloCompleto.dettaglioCalcolo.dettaglio}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Totali */}
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Riepilogo
                    </h3>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Totale Lordo</span>
                        <span className="text-xl font-bold">{formatCurrency(stipendioSocio.calcoloCompleto.totaleLordo)}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                        <span className="font-medium">Totale Netto</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(stipendioSocio.calcoloCompleto.totaleNetto)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!stipendioSocio.calcoloCompleto && stipendioSocio.numeroServizi === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nessun servizio registrato per questo periodo</p>
                </div>
              )}
            </>
          )}

          {/* Dettagli DIPENDENTE */}
          {isDipendente && stipendioDipendente && (
            <>
              {stipendioDipendente.hasStipendioSalvato && stipendioDipendente.stipendioSalvato ? (
                <>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Stipendio Manuale
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stipendio fisso configurato</span>
                        <span className="font-medium">{formatCurrency(stipendioDipendente.stipendioFisso)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold">Riepilogo</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">Totale Lordo</span>
                        <span className="text-xl font-bold">{formatCurrency(stipendioDipendente.stipendioSalvato.totale_lordo)}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                        <span className="font-medium">Totale Netto</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(stipendioDipendente.stipendioSalvato.totale_netto)}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Stipendio non ancora creato per questo periodo</p>
                  {stipendioDipendente.stipendioFisso > 0 && (
                    <p className="text-sm mt-2">Stipendio fisso: {formatCurrency(stipendioDipendente.stipendioFisso)}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
