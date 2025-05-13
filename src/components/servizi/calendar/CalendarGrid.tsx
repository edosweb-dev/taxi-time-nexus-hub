
import { isSameDay, parseISO } from "date-fns";
import { TimeColumn } from "./TimeColumn";
import { DayColumn } from "./DayColumn";
import { CalendarGridProps } from "./types";

export const CalendarGrid = ({ 
  viewMode, 
  daysInView, 
  hours, 
  serviziInView, 
  getServizioPosition,
  onNavigateToDetail,
  getAziendaName
}: CalendarGridProps) => {
  return (
    <div className="bg-background border rounded-md overflow-auto">
      <div className="flex">
        <TimeColumn hours={hours} />
        
        {/* Days columns - Full width for both day and week views */}
        <div className={`flex-1 flex ${viewMode === "day" ? "" : "divide-x"}`}>
          {daysInView.map((day) => {
            const serviziOfDay = serviziInView.filter(s => 
              isSameDay(parseISO(s.data_servizio), day)
            );
            
            return (
              <DayColumn 
                key={day.toISOString()}
                day={day}
                serviziOfDay={serviziOfDay}
                getServizioPosition={getServizioPosition}
                onNavigateToDetail={onNavigateToDetail}
                getAziendaName={getAziendaName}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
