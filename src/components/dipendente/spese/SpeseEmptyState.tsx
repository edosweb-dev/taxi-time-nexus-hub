import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ReceiptText, SearchX } from 'lucide-react';

interface SpeseEmptyStateProps {
  type: 'no-spese' | 'no-results';
  onNuovaSpesa?: () => void;
  onResetFilters?: () => void;
}

export function SpeseEmptyState({ type, onNuovaSpesa, onResetFilters }: SpeseEmptyStateProps) {
  if (type === 'no-spese') {
    return (
      <Card className="p-12 text-center">
        <ReceiptText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Nessuna spesa registrata</h3>
        <p className="text-muted-foreground mb-4">
          Aggiungi la tua prima spesa per iniziare
        </p>
        {onNuovaSpesa && (
          <Button onClick={onNuovaSpesa}>
            + Nuova Spesa
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-12 text-center">
      <SearchX className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-xl font-semibold mb-2">Nessuna spesa trovata</h3>
      <p className="text-muted-foreground mb-4">
        Prova a modificare i filtri
      </p>
      {onResetFilters && (
        <Button onClick={onResetFilters} variant="outline">
          Reset Filtri
        </Button>
      )}
    </Card>
  );
}
