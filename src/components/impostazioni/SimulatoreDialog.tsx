import React, { useState, useEffect } from 'react';
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
import { Calculator, Loader2 } from 'lucide-react';
import { useSimulatoreCalcolo } from '@/hooks/useConfigurazioneStipendi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SimulatoreDialogProps {
  anno: number;
}

export function SimulatoreDialog({ anno }: SimulatoreDialogProps) {
  const [open, setOpen] = useState(false);
  const [kmTotali, setKmTotali] = useState<string>('');
  const [oreAttesa, setOreAttesa] = useState<string>('0');
  
  const simulatoreMutation = useSimulatoreCalcolo();

  useEffect(() => {
    if (open && kmTotali && parseFloat(kmTotali) > 0) {
      const km = parseFloat(kmTotali);
      const ore = parseFloat(oreAttesa) || 0;
      
      if (!isNaN(km) && !isNaN(ore)) {
        simulatoreMutation.mutate({ kmTotali: km, oreAttesa: ore, anno });
      }
    }
  }, [kmTotali, oreAttesa, open, anno]);

  const result = simulatoreMutation.data;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calculator className="mr-2 h-4 w-4" />
          Simulatore
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Simulatore Calcolo Stipendio</DialogTitle>
          <DialogDescription>
            Calcola in anteprima lo stipendio basato su KM e ore attesa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sim-km">KM Totali</Label>
            <Input
              id="sim-km"
              type="number"
              step="1"
              value={kmTotali}
              onChange={(e) => setKmTotali(e.target.value)}
              placeholder="Es: 150"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sim-ore">Ore Attesa</Label>
            <Input
              id="sim-ore"
              type="number"
              step="0.5"
              value={oreAttesa}
              onChange={(e) => setOreAttesa(e.target.value)}
              placeholder="Es: 2.5"
            />
          </div>

          {simulatoreMutation.isPending && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {result && !simulatoreMutation.isPending && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Modalità Calcolo:</span>
                  <Badge variant={result.modalitaCalcolo === 'tabella' ? 'default' : 'secondary'}>
                    {result.modalitaCalcolo === 'tabella' ? 'Tabella (≤200km)' : 'Lineare (>200km)'}
                  </Badge>
                </div>

                {result.dettaglioCalcolo && (
                  <div className="text-xs text-muted-foreground bg-background p-2 rounded border">
                    {result.dettaglioCalcolo}
                  </div>
                )}

                <div className="h-px bg-border" />

                <div className="flex justify-between">
                  <span className="text-sm">Base KM:</span>
                  <span className="font-semibold">€{result.baseKm.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Coefficiente {result.percentualeAumento}:</span>
                  <span>€{result.baseConAumento.toFixed(2)}</span>
                </div>

                {result.importoOreAttesa > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Ore Attesa ({parseFloat(oreAttesa)}h × €{result.tariffaOraria}):</span>
                    <span>€{result.importoOreAttesa.toFixed(2)}</span>
                  </div>
                )}

                <div className="h-px bg-border" />

                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-lg">Totale Lordo:</span>
                  <span className="font-bold text-2xl text-primary">
                    €{result.totaleLordo.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {simulatoreMutation.isError && (
            <div className="text-sm text-destructive text-center p-4 border border-destructive/20 rounded bg-destructive/5">
              Errore nel calcolo. Verifica i parametri inseriti.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
