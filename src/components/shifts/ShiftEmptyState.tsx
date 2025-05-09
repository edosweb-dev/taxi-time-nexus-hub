
import { Button } from '@/components/ui/button';

interface ShiftEmptyStateProps {
  onAddShift: () => void;
}

export function ShiftEmptyState({ onAddShift }: ShiftEmptyStateProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Nessun turno trovato per questo mese</p>
      <Button 
        variant="outline"
        className="mt-2" 
        onClick={onAddShift}
      >
        Aggiungi turno
      </Button>
    </div>
  );
}
