import { Card } from '@/components/ui/card';

interface SpeseStatsProps {
  stats: {
    inAttesa: { totale: number; count: number };
    approvate: { totale: number; count: number };
    rifiutate: { totale: number; count: number };
    totaleMese: number;
  };
}

export function SpeseStats({ stats }: SpeseStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-2xl">💰</span>
        RIEPILOGO
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">In Attesa</p>
          <p className="text-lg font-bold text-yellow-600">
            {formatCurrency(stats.inAttesa.totale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.inAttesa.count} {stats.inAttesa.count === 1 ? 'spesa' : 'spese'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Approvate</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(stats.approvate.totale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.approvate.count} {stats.approvate.count === 1 ? 'spesa' : 'spese'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Rifiutate</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(stats.rifiutate.totale)}
          </p>
          <p className="text-xs text-muted-foreground">
            {stats.rifiutate.count} {stats.rifiutate.count === 1 ? 'spesa' : 'spese'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Totale Mese</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(stats.totaleMese)}
          </p>
        </div>
      </div>
    </Card>
  );
}
