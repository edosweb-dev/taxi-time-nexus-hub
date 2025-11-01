import { SpesaCard } from './SpesaCard';
import { Skeleton } from '@/components/ui/skeleton';

interface SpesaListProps {
  spese: Array<{
    id: string;
    causale: string;
    importo: number;
    data_spesa: string;
    note?: string | null;
    stato: 'in_attesa' | 'approvata' | 'non_autorizzata' | 'in_revisione';
    approved_by_profile?: {
      first_name: string | null;
      last_name: string | null;
    };
    approved_at?: string | null;
    note_revisione?: string | null;
  }>;
  isLoading?: boolean;
  onSpesaClick: (spesaId: string) => void;
}

export function SpeseList({ spese, isLoading, onSpesaClick }: SpesaListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">LISTA SPESE</h2>
      
      {spese.map((spesa) => (
        <SpesaCard
          key={spesa.id}
          spesa={spesa}
          onClick={() => onSpesaClick(spesa.id)}
        />
      ))}
    </div>
  );
}
