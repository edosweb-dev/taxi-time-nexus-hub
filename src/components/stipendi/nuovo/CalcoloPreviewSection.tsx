
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { SectionProps } from './types';

interface CalcoloPreviewSectionProps extends SectionProps {
  watchedValues: any;
  calcolo: any;
  isCalculating: boolean;
}

export function CalcoloPreviewSection({
  selectedUser,
  watchedValues,
  calcolo,
  isCalculating,
}: CalcoloPreviewSectionProps) {
  if (!selectedUser) return null;

  // Preview per soci
  if (selectedUser.role === 'socio' && watchedValues.km && watchedValues.km >= 12) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Preview Calcolo</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Calcolo Stipendio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isCalculating ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Calcolando...</span>
              </div>
            ) : calcolo ? (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base KM:</span>
                    <span>€{calcolo.baseKm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aumento 17%:</span>
                    <span>€{(calcolo.baseConAumento - calcolo.baseKm).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ore attesa:</span>
                    <span>€{calcolo.importoOreAttesa.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>= Lordo:</span>
                    <span>€{calcolo.totaleLordo.toFixed(2)}</span>
                  </div>
                  
                  {calcolo.detrazioni && (
                    <>
                      <div className="flex justify-between text-red-600">
                        <span>Spese:</span>
                        <span>-€{calcolo.detrazioni.totaleSpesePersonali.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Prelievi:</span>
                        <span>-€{calcolo.detrazioni.totalePrelievi.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Incassi:</span>
                        <span>+€{calcolo.detrazioni.incassiDaDipendenti.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Riporto:</span>
                        <span>+€{calcolo.detrazioni.riportoMesePrecedente.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>= NETTO:</span>
                        <span>€{calcolo.totaleNetto.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Inserisci i dati per vedere il calcolo
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preview per dipendenti/admin
  if ((selectedUser.role === 'dipendente' || selectedUser.role === 'admin') && 
      watchedValues.ore_lavorate && watchedValues.tariffa_oraria) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Preview Calcolo</h3>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Calcolo Stipendio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ore lavorate:</span>
                <span>{watchedValues.ore_lavorate}h</span>
              </div>
              <div className="flex justify-between">
                <span>Tariffa oraria:</span>
                <span>€{watchedValues.tariffa_oraria.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>= LORDO:</span>
                <span>€{(watchedValues.ore_lavorate * watchedValues.tariffa_oraria).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
