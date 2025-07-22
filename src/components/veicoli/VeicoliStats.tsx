import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Veicolo } from '@/lib/types/veicoli';

interface VeicoliStatsProps {
  veicoli: Veicolo[];
}

export function VeicoliStats({ veicoli }: VeicoliStatsProps) {
  const stats = useMemo(() => {
    const totaleVeicoli = veicoli.length;
    const veicoliAttivi = veicoli.filter(v => v.attivo).length;
    const veicoliInattivi = totaleVeicoli - veicoliAttivi;
    const mediaPosti = veicoli.length > 0 
      ? Math.round(veicoli.reduce((sum, v) => sum + (v.numero_posti || 0), 0) / veicoli.length)
      : 0;

    return {
      totaleVeicoli,
      veicoliAttivi,
      veicoliInattivi,
      mediaPosti,
    };
  }, [veicoli]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Totale Veicoli</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totaleVeicoli}</div>
          <p className="text-xs text-muted-foreground">
            Flotta completa
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Veicoli Attivi</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.veicoliAttivi}</div>
          <p className="text-xs text-muted-foreground">
            Disponibili per servizi
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Veicoli Inattivi</CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{stats.veicoliInattivi}</div>
          <p className="text-xs text-muted-foreground">
            Non disponibili
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Media Posti</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.mediaPosti}</div>
          <p className="text-xs text-muted-foreground">
            Capacità media flotta
          </p>
        </CardContent>
      </Card>
    </div>
  );
}