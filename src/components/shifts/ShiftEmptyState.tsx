
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface ShiftEmptyStateProps {
  onAddShift: () => void;
}

export function ShiftEmptyState({ onAddShift }: ShiftEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4">Nessun turno trovato per questo mese</p>
      <Button 
        variant="outline"
        onClick={onAddShift}
        className="flex items-center"
      >
        Aggiungi turno
      </Button>
    </div>
  );
}
