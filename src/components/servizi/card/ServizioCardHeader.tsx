
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Servizio } from "@/lib/types/servizi";
import { getStatoBadge, getStateIcon } from "../utils";
import { formatProgressiveId } from "../utils/formatUtils";

interface ServizioCardHeaderProps {
  servizio: Servizio;
  index: number;
}

export const ServizioCardHeader = ({ servizio, index }: ServizioCardHeaderProps) => {
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {format(new Date(servizio.data_servizio), "EEEE d MMMM yyyy", { locale: it })}
          </span>
        </div>
        {getStatoBadge(servizio.stato)}
      </div>
      <CardTitle className="text-base mt-2 flex justify-between items-center">
        <div>
          {formatProgressiveId(servizio.id, index)}: {servizio.numero_commessa || "Servizio di trasporto"}
        </div>
        {getStateIcon(servizio.stato) && (
          <div className="text-muted-foreground">
            {getStateIcon(servizio.stato)}
          </div>
        )}
      </CardTitle>
    </CardHeader>
  );
};
