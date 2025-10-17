import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save } from 'lucide-react';
import { ConfigurazioneStipendi } from '@/lib/types/stipendi';
import { useUpdateConfigStipendi } from '@/hooks/useConfigurazioneStipendi';

interface ParametriGlobaliCardProps {
  config: ConfigurazioneStipendi | null;
  anno: number;
  isLoading?: boolean;
}

export function ParametriGlobaliCard({ config, anno, isLoading }: ParametriGlobaliCardProps) {
  const [coefficiente, setCoefficiente] = useState<string>('1.17');
  const [tariffaOraria, setTariffaOraria] = useState<string>('15.00');
  const [tariffaOltre200, setTariffaOltre200] = useState<string>('0.25');

  const updateMutation = useUpdateConfigStipendi();

  useEffect(() => {
    if (config) {
      setCoefficiente(config.coefficiente_aumento.toString());
      setTariffaOraria(config.tariffa_oraria_attesa.toString());
      setTariffaOltre200((config.tariffa_oltre_200km || 0.25).toString());
    }
  }, [config]);

  const handleSave = async () => {
    const coeff = parseFloat(coefficiente);
    const oraria = parseFloat(tariffaOraria);
    const oltre = parseFloat(tariffaOltre200);

    if (isNaN(coeff) || isNaN(oraria) || isNaN(oltre)) return;

    await updateMutation.mutateAsync({
      anno,
      config: {
        coefficiente_aumento: coeff,
        tariffa_oraria_attesa: oraria,
        tariffa_oltre_200km: oltre
      }
    });
  };

  const percentualeAumento = ((parseFloat(coefficiente) - 1) * 100).toFixed(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Parametri Globali</CardTitle>
        <CardDescription>
          Configurazione parametri di calcolo per l'anno {anno}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="coefficiente">Coefficiente Aumento</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="coefficiente"
              type="number"
              step="0.01"
              value={coefficiente}
              onChange={(e) => setCoefficiente(e.target.value)}
              className="max-w-32"
              disabled={isLoading}
            />
            <Badge variant="secondary">
              {parseFloat(coefficiente) >= 1 ? '+' : ''}{percentualeAumento}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Es: 1.17 = aumento del 17%
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tariffaOraria">Tariffa Oraria Attesa (€/h)</Label>
          <Input
            id="tariffaOraria"
            type="number"
            step="0.01"
            value={tariffaOraria}
            onChange={(e) => setTariffaOraria(e.target.value)}
            className="max-w-32"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Tariffa per ore di attesa
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tariffaOltre200">Tariffa oltre 200km (€/km)</Label>
          <Input
            id="tariffaOltre200"
            type="number"
            step="0.01"
            value={tariffaOltre200}
            onChange={(e) => setTariffaOltre200(e.target.value)}
            className="max-w-32"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Tariffa per km oltre i 200
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending || isLoading}
          className="w-full"
        >
          <Save className="mr-2 h-4 w-4" />
          {updateMutation.isPending ? 'Salvataggio...' : 'Salva Parametri'}
        </Button>
      </CardContent>
    </Card>
  );
}
