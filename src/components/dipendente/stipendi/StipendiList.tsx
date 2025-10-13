import { StipendioCard } from './StipendioCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface StipendiListProps {
  stipendi: Array<{
    id: string;
    mese: number;
    anno: number;
    stato: 'bozza' | 'confermato' | 'pagato';
    totale_netto: number;
    totale_km: number;
    totale_ore_lavorate: number;
  }>;
  isLoading?: boolean;
  anno: number;
  onStipendioClick: (stipendioId: string) => void;
}

export function StipendiList({ stipendi, isLoading, anno, onStipendioClick }: StipendiListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (stipendi.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          Nessuno stipendio per il {anno}
        </h3>
        <p className="text-muted-foreground">
          Seleziona un altro anno o attendi che vengano generati gli stipendi
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-2xl">📋</span>
        STORICO STIPENDI
      </h2>
      
      {stipendi.map((stipendio) => (
        <StipendioCard
          key={stipendio.id}
          stipendio={stipendio}
          onClick={() => onStipendioClick(stipendio.id)}
        />
      ))}
    </div>
  );
}
