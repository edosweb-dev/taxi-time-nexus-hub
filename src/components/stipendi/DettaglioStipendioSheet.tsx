
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CalendarDays, 
  User, 
  Clock, 
  Printer,
  Edit,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import { useStipendioDetail } from '@/hooks/useStipendi';
import { formatCurrency } from '@/lib/utils';
import { getInitials, getRuoloBadge, getStatoBadge } from './TabellaStipendi/utils';

interface DettaglioStipendioSheetProps {
  stipendioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (stipendioId: string) => void;
  onConfirm?: (stipendioId: string) => void;
  onMarkPaid?: (stipendioId: string) => void;
  onPrint?: (stipendioId: string) => void;
}

export function DettaglioStipendioSheet({
  stipendioId,
  open,
  onOpenChange,
  onEdit,
  onConfirm,
  onMarkPaid,
  onPrint
}: DettaglioStipendioSheetProps) {
  const { data: stipendio, isLoading } = useStipendioDetail(stipendioId);

  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!stipendio) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Stipendio non trovato</SheetTitle>
            <SheetDescription>
              Lo stipendio richiesto non è stato trovato.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  // Calcola detrazioni e aggiunte
  const detrazioni = (Number(stipendio.totale_spese) || 0) + (Number(stipendio.totale_prelievi) || 0);
  const aggiunte = (Number(stipendio.incassi_da_dipendenti) || 0) + (Number(stipendio.riporto_mese_precedente) || 0);

  // Calcola percentuale per soci (placeholder - dovrebbe venire dal contesto o calcolo)
  const percentualeTotale = stipendio.percentuale_su_totale || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dettaglio Stipendio</SheetTitle>
          <SheetDescription>
            Visualizza tutti i dettagli del calcolo stipendio
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {getInitials(stipendio.user?.first_name, stipendio.user?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {stipendio.user?.first_name} {stipendio.user?.last_name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getRuoloBadge(stipendio.tipo_calcolo)}
                    {getStatoBadge(stipendio.stato)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {months[stipendio.mese - 1]} {stipendio.anno}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Informazioni Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Informazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data creazione:</span>
                <span>{new Date(stipendio.created_at).toLocaleDateString('it-IT')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ultimo aggiornamento:</span>
                <span>{new Date(stipendio.updated_at).toLocaleDateString('it-IT')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Creato da:</span>
                <span>Sistema</span>
              </div>
            </CardContent>
          </Card>

          {/* Calcolo Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Calcolo Stipendio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stipendio.tipo_calcolo === 'socio' ? (
                <>
                  <div className="flex justify-between">
                    <span>KM percorsi:</span>
                    <span className="font-medium">{stipendio.totale_km || 0} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base chilometrica:</span>
                    <span>{formatCurrency(Number(stipendio.base_calcolo) || 0)}</span>
                  </div>
                  {stipendio.coefficiente_applicato && (
                    <div className="flex justify-between">
                      <span>+ Aumento {(Number(stipendio.coefficiente_applicato) * 100).toFixed(0)}%:</span>
                      <span>{formatCurrency(((Number(stipendio.base_calcolo) || 0) * Number(stipendio.coefficiente_applicato)))}</span>
                    </div>
                  )}
                  {stipendio.totale_ore_attesa && Number(stipendio.totale_ore_attesa) > 0 && (
                    <div className="flex justify-between">
                      <span>+ Ore attesa ({stipendio.totale_ore_attesa}h × 15€):</span>
                      <span>{formatCurrency(Number(stipendio.totale_ore_attesa) * 15)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Totale Lordo:</span>
                    <span>{formatCurrency(Number(stipendio.totale_lordo) || 0)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Ore lavorate:</span>
                    <span className="font-medium">{stipendio.totale_ore_lavorate || 0} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>× Tariffa oraria:</span>
                    <span>{formatCurrency((Number(stipendio.totale_lordo) || 0) / (Number(stipendio.totale_ore_lavorate) || 1))}/h</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Totale Lordo:</span>
                    <span>{formatCurrency(Number(stipendio.totale_lordo) || 0)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Detrazioni/Aggiunte Card */}
          {(detrazioni > 0 || aggiunte > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Detrazioni e Aggiunte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Number(stipendio.totale_spese) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="text-red-500">🔴</span>
                      Spese:
                    </span>
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(Number(stipendio.totale_spese))}
                    </span>
                  </div>
                )}
                {Number(stipendio.totale_prelievi) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="text-red-500">🔴</span>
                      Prelievi:
                    </span>
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(Number(stipendio.totale_prelievi))}
                    </span>
                  </div>
                )}
                {Number(stipendio.incassi_da_dipendenti) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="text-green-500">🟢</span>
                      Incassi:
                    </span>
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(Number(stipendio.incassi_da_dipendenti))}
                    </span>
                  </div>
                )}
                {Number(stipendio.riporto_mese_precedente) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="text-green-500">🟢</span>
                      Riporto:
                    </span>
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(Number(stipendio.riporto_mese_precedente))}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Totale Netto Card */}
          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">TOTALE NETTO</div>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(Number(stipendio.totale_netto) || 0)}
                </div>
                {stipendio.tipo_calcolo === 'socio' && percentualeTotale > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {percentualeTotale.toFixed(1)}% del totale soci
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Note Card */}
          {stipendio.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {stipendio.note}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onPrint?.(stipendioId)}
              className="flex-1"
            >
              <Printer className="mr-2 h-4 w-4" />
              Stampa
            </Button>
            
            {stipendio.stato === 'bozza' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => onEdit?.(stipendioId)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifica
                </Button>
                <Button
                  onClick={() => onConfirm?.(stipendioId)}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Conferma
                </Button>
              </>
            )}
            
            {stipendio.stato === 'confermato' && (
              <Button
                onClick={() => onMarkPaid?.(stipendioId)}
                className="flex-1"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Segna pagato
              </Button>
            )}
            
            {stipendio.stato === 'pagato' && (
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Chiudi
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
