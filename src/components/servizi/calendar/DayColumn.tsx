
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarEvent } from "./CalendarEvent";
import { DayColumnProps } from "./types";

export const DayColumn = ({ 
  day, 
  serviziOfDay, 
  getServizioPosition, 
  onNavigateToDetail,
  getAziendaName 
}: DayColumnProps) => {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const isToday = isSameDay(day, new Date());

  return (
    <div className="flex-1 relative">
      {/* Day header */}
      <div className={`h-10 flex justify-center items-center border-b bg-muted/50 sticky top-0 z-20 
        ${isToday ? "font-bold text-primary" : ""}`}
      >
        <div className="text-sm">
          {format(day, "EEE", { locale: it })}
        </div>
        <div className="text-sm ml-1">
          {format(day, "d", { locale: it })}
        </div>
      </div>
      
      {/* Hour grid lines */}
      {hours.map((hour) => (
        <div 
          key={`${day.toISOString()}-${hour}`}
          className="h-[60px] border-b"
        />
      ))}
      
      {/* Servizi for the day */}
      {serviziOfDay.map(servizio => {
        const { top, height } = getServizioPosition(servizio);
        return (
          <CalendarEvent
            key={servizio.id}
            servizio={servizio}
            top={top}
            height={height}
            onClick={() => onNavigateToDetail(servizio.id)}
            aziendaName={getAziendaName(servizio.azienda_id)}
          />
        );
      })}
    </div>
  );
};
