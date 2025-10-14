import { CalendarCheck, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiziEmptyStateProps {
  type: "no-servizi" | "no-results";
  onReset?: () => void;
}

export const ServiziEmptyState = ({ type, onReset }: ServiziEmptyStateProps) => {
  if (type === "no-servizi") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <CalendarCheck className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Nessun servizio assegnato
        </h2>
        <p className="text-muted-foreground">
          Goditi il riposo!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">
        Nessun servizio trovato
      </h2>
      <p className="text-muted-foreground mb-4">
        Prova a modificare i filtri
      </p>
      {onReset && (
        <Button variant="outline" onClick={onReset}>
          Reset Filtri
        </Button>
      )}
    </div>
  );
};
