
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Servizio } from "@/lib/types/servizi";

interface ServizioCardDateTimeProps {
  servizio: Servizio;
}

export const ServizioCardDateTime = ({ servizio }: ServizioCardDateTimeProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="flex items-start gap-1">
        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Data</div>
          <div className="text-muted-foreground">
            {format(new Date(servizio.data_servizio), "dd/MM/yyyy")}
          </div>
        </div>
      </div>
      <div className="flex items-start gap-1">
        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          <div className="font-medium">Orario</div>
          <div className="text-muted-foreground">{servizio.orario_servizio}</div>
        </div>
      </div>
    </div>
  );
};
