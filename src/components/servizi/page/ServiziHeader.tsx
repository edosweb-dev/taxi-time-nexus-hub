import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from "lucide-react";
import { InserimentoServizioModal } from "@/components/servizi/InserimentoServizioModal";

interface ServiziHeaderProps {
  onShowCalendarView: () => void;
  onCreateNewServizio: () => void;
  isCalendarViewActive: boolean;
}

export function ServiziHeader({ 
  onShowCalendarView, 
  onCreateNewServizio, 
  isCalendarViewActive 
}: ServiziHeaderProps) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servizi</h1>
          <p className="text-muted-foreground">
            Gestisci i servizi di trasporto
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={isCalendarViewActive ? "default" : "outline"} 
            onClick={onShowCalendarView}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Calendario
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuovo servizio
          </Button>
        </div>
      </div>
      
      <InserimentoServizioModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
