
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  onBack: () => void;
}

export function ErrorState({ onBack }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Errore</h2>
      <p className="text-muted-foreground mb-6">
        Si è verificato un errore nel caricamento del servizio o il servizio non esiste.
      </p>
      <Button onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna ai servizi
      </Button>
    </div>
  );
}
