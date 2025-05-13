
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from "lucide-react";

interface ServiziHeaderProps {
  onShowCalendarView: () => void;
  onCreateNewServizio: () => void;
}

export function ServiziHeader({ onShowCalendarView, onCreateNewServizio }: ServiziHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Servizi</h1>
        <p className="text-muted-foreground">
          Gestisci i servizi di trasporto
        </p>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={onShowCalendarView}>
          <Calendar className="mr-2 h-4 w-4" />
          Calendario
        </Button>
        <Button onClick={onCreateNewServizio}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuovo servizio
        </Button>
      </div>
    </div>
  );
}
