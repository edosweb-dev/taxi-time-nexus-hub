import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bug, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSimulatoreCalcolo } from '@/hooks/useConfigurazioneStipendi';
import { useCalcoloStipendioManuale } from '@/hooks/useCalcoloStipendio';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);

export function VerificaCalcolo() {
  const [open, setOpen] = useState(false);
  const [userId] = useState<string>('00000000-0000-0000-0000-000000000000'); // Test user
  const [anno] = useState<number>(new Date().getFullYear());
  const [mese] = useState<number>(new Date().getMonth() + 1);
  const [km, setKm] = useState<string>('150');
  const [oreAttesa, setOreAttesa] = useState<string>('2');

  const simulatoreMutation = useSimulatoreCalcolo();
  const { calcola, lastResult: calcoloCompleto, isCalculating } = useCalcoloStipendioManuale();

  const handleTest = async () => {
    const kmNum = parseFloat(km);
    const oreNum = parseFloat(oreAttesa);

    if (isNaN(kmNum) || isNaN(oreNum)) return;

    // Esegui simulatore
    simulatoreMutation.mutate({ kmTotali: kmNum, oreAttesa: oreNum, anno });

    // Esegui calcolo completo
    try {
      await calcola({
        userId,
        mese,
        anno,
        km: kmNum,
        oreAttesa: oreNum
      });
    } catch (error) {
      console.error('Errore calcolo completo:', error);
    }
  };

  const simulatore = simulatoreMutation.data;
  const completo = calcoloCompleto;

  // Verifica coerenza
  const isCoerente = simulatore && completo && 
    Math.abs(simulatore.totaleLordo - completo.totaleLordo) < 0.01;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bug className="mr-2 h-4 w-4" />
          Debug Calcolo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verifica Coerenza Calcolo Stipendio</DialogTitle>
          <DialogDescription>
            Confronta risultati tra Simulatore e Calcolo Completo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-km">KM Totali</Label>
              <Input
                id="test-km"
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-ore">Ore Attesa</Label>
              <Input
                id="test-ore"
                type="number"
                step="0.5"
                value={oreAttesa}
                onChange={(e) => setOreAttesa(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleTest} 
            className="w-full"
            disabled={isCalculating || simulatoreMutation.isPending}
          >
            {(isCalculating || simulatoreMutation.isPending) ? 'Calcolo in corso...' : 'Esegui Test'}
          </Button>

          {/* Status */}
          {simulatore && completo && (
            <Alert variant={isCoerente ? "default" : "destructive"}>
              {isCoerente ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    ✅ I calcoli sono coerenti! Differenza: {formatCurrency(Math.abs(simulatore.totaleLordo - completo.totaleLordo))}
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ I calcoli differiscono! Differenza: {formatCurrency(Math.abs(simulatore.totaleLordo - completo.totaleLordo))}
                  </AlertDescription>
                </>
              )}
            </Alert>
          )}

          {/* Risultati affiancati */}
          <div className="grid grid-cols-2 gap-4">
            {/* SIMULATORE */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Simulatore
                  <Badge variant="outline">Solo KM+Ore</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {simulatore ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modalità:</span>
                      <Badge variant="secondary">{simulatore.modalitaCalcolo}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Base KM:</span>
                      <span className="font-mono">{formatCurrency(simulatore.baseKm)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Con aumento:</span>
                      <span className="font-mono">{formatCurrency(simulatore.baseConAumento)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ore attesa:</span>
                      <span className="font-mono">{formatCurrency(simulatore.importoOreAttesa)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Totale Lordo:</span>
                      <span className="font-mono">{formatCurrency(simulatore.totaleLordo)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                      {simulatore.dettaglioCalcolo}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nessun risultato</p>
                )}
              </CardContent>
            </Card>

            {/* CALCOLO COMPLETO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Calcolo Completo
                  <Badge variant="outline">Con Detrazioni</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completo ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modalità:</span>
                      <Badge variant="secondary">{completo.dettaglioCalcolo.modalitaCalcolo}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Base KM:</span>
                      <span className="font-mono">{formatCurrency(completo.baseKm)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Con aumento:</span>
                      <span className="font-mono">{formatCurrency(completo.baseConAumento)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ore attesa:</span>
                      <span className="font-mono">{formatCurrency(completo.importoOreAttesa)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Totale Lordo:</span>
                      <span className="font-mono">{formatCurrency(completo.totaleLordo)}</span>
                    </div>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Spese personali:</span>
                        <span className="text-green-600">+{formatCurrency(completo.detrazioni.totaleSpesePersonali)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Prelievi:</span>
                        <span className="text-red-600">-{formatCurrency(completo.detrazioni.totalePrelievi)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Incassi dipendenti:</span>
                        <span className="text-red-600">-{formatCurrency(completo.detrazioni.incassiDaDipendenti)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-primary">
                      <span>Totale Netto:</span>
                      <span className="font-mono">{formatCurrency(completo.totaleNetto)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                      {completo.dettaglioCalcolo.dettaglio}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nessun risultato</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
