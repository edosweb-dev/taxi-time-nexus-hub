import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface StipendiStatsProps {
  stats: {
    totalePagato: number;
    mediaMensile: number;
    numeroStipendi: number;
    ultimoPagamento: {
      mese: number;
      anno: number;
      importo: number;
    } | null;
  };
  anno: number;
}

export function StipendiStats({ stats, anno }: StipendiStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatMeseAnno = (mese: number, anno: number) => {
    const date = new Date(anno, mese - 1);
    return format(date, 'MMMM yyyy', { locale: it });
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        RIEPILOGO ANNO {anno}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Totale Pagato</p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(stats.totalePagato)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Media Mensile</p>
          <p className="text-xl font-bold text-primary">
            {formatCurrency(stats.mediaMensile)}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Stipendi Ricevuti</p>
          <p className="text-xl font-bold text-primary">
            {stats.numeroStipendi}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Ultimo Pagamento</p>
          {stats.ultimoPagamento ? (
            <p className="text-xl font-bold text-primary">
              {formatMeseAnno(stats.ultimoPagamento.mese, stats.ultimoPagamento.anno)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">-</p>
          )}
        </div>
      </div>
    </Card>
  );
}
