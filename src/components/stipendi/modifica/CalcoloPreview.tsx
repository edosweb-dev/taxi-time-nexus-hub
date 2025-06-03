
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CalcoloStipendioCompleto } from '@/lib/api/stipendi/calcolaStipendio';

interface CalcoloPreviewProps {
  tipoCalcolo: 'socio' | 'dipendente';
  watchedValues: {
    km?: number;
    ore_attesa?: number;
    ore_lavorate?: number;
    tariffa_oraria?: number;
  };
  calcolo?: CalcoloStipendioCompleto | null;
  isCalculating?: boolean;
}

export function CalcoloPreview({ 
  tipoCalcolo, 
  watchedValues, 
  calcolo, 
  isCalculating 
}: CalcoloPreviewProps) {
  // Preview per soci
  if (tipoCalcolo === 'socio' && watchedValues.km) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Anteprima Calcolo
            {isCalculating && <span className="text-xs text-muted-foreground">(Calcolando...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {calcolo ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base chilometrica:</span>
                <span>{formatCurrency(calcolo.baseKm)}</span>
              </div>
              <div className="flex justify-between">
                <span>+ Aumento:</span>
                <span>{formatCurrency(calcolo.dettaglioCalcolo.parametriUsati.coefficienteAumento * calcolo.baseKm)}</span>
              </div>
              {watchedValues.ore_attesa && watchedValues.ore_attesa > 0 && (
                <div className="flex justify-between">
                  <span>+ Ore attesa:</span>
                  <span>{formatCurrency(calcolo.importoOreAttesa)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Totale Lordo:</span>
                <span>{formatCurrency(calcolo.totaleLordo)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-primary">
                <span>Totale Netto:</span>
                <span>{formatCurrency(calcolo.totaleNetto)}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Inserisci i KM per vedere l'anteprima del calcolo
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Preview per dipendenti
  if (tipoCalcolo === 'dipendente' && watchedValues.ore_lavorate && watchedValues.tariffa_oraria) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Anteprima Calcolo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Ore lavorate:</span>
              <span>{watchedValues.ore_lavorate}h</span>
            </div>
            <div className="flex justify-between">
              <span>× Tariffa oraria:</span>
              <span>{formatCurrency(watchedValues.tariffa_oraria)}/h</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg text-primary">
              <span>Totale:</span>
              <span>{formatCurrency(watchedValues.ore_lavorate * watchedValues.tariffa_oraria)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
