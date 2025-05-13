
import { Servizio } from "@/lib/types/servizi";
import { CalendarEventProps } from "./types";

// Define color classes for each status
export const getServizioStatusColor = (stato: string) => {
  switch (stato) {
    case 'da_assegnare':
      return "bg-amber-400/90 hover:bg-amber-500/90 text-amber-950";
    case 'assegnato':
      return "bg-blue-400/90 hover:bg-blue-500/90 text-blue-950";
    case 'completato':
      return "bg-green-400/90 hover:bg-green-500/90 text-green-950";
    case 'annullato':
      return "bg-red-400/90 hover:bg-red-500/90 text-red-950";
    case 'non_accettato':
      return "bg-purple-400/90 hover:bg-purple-500/90 text-purple-950";
    case 'consuntivato':
      return "bg-slate-400/90 hover:bg-slate-500/90 text-slate-950";
    default:
      return "bg-primary/80 hover:bg-primary text-white";
  }
};

export const CalendarEvent = ({ servizio, top, height, onClick, aziendaName }: CalendarEventProps) => {
  const colorClass = getServizioStatusColor(servizio.stato);
  
  return (
    <div 
      className={`absolute left-1 right-1 ${colorClass} rounded px-2 py-1 overflow-hidden cursor-pointer transition-colors shadow-sm`}
      style={{ 
        top: `${top}px`, 
        height: `${height}px`,
        zIndex: 10
      }}
      onClick={onClick}
    >
      <div className="font-medium text-xs truncate">
        {servizio.orario_servizio} - {servizio.numero_commessa || "Servizio"}
      </div>
      <div className="text-xs truncate">
        {aziendaName}
      </div>
    </div>
  );
};
