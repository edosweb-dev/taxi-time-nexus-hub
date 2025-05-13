
import { StatoServizio } from "@/lib/types/servizi";
import { getServizioStatusColor } from "./CalendarEvent";
import { getStatoLabel } from "../utils/statusUtils";

export const CalendarLegend = () => {
  // Only these specific service statuses will be shown in the legend
  const statuses: StatoServizio[] = [
    'da_assegnare',
    'assegnato',
    'completato',
    'consuntivato',
  ];

  return (
    <div className="flex flex-wrap gap-4 my-2">
      {statuses.map((status) => {
        const colorClass = getServizioStatusColor(status);
        // Extract just the background color class (bg-color-XXX)
        const bgColorClass = colorClass.split(' ')[0];
        
        return (
          <div key={status} className="flex items-center">
            <div 
              className={`${bgColorClass} w-4 h-4 mr-2 rounded`}
              aria-hidden="true"
            />
            <span className="text-sm">{getStatoLabel(status)}</span>
          </div>
        );
      })}
    </div>
  );
};
