
import { Users } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nessun stipendio trovato</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Non ci sono stipendi per i filtri selezionati.
      </p>
    </div>
  );
}
