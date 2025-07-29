
import { isSameDay, parseISO, format } from "date-fns";
import { it } from "date-fns/locale";
import { Shift } from "../types";
import { ShiftTimeColumn } from "./ShiftTimeColumn";
import { ShiftDayColumn } from "./ShiftDayColumn";

interface ShiftCalendarGridProps {
  viewMode: "day" | "week";
  daysInView: Date[];
  hours: number[];
  shiftsInView: Shift[];
  getShiftPosition: (shift: Shift) => { top: number; height: number; spanRows: boolean };
  onSelectShift: (shift: Shift) => void;
  onAddShift: (day: Date) => void;
}

export const ShiftCalendarGrid = ({ 
  viewMode, 
  daysInView, 
  hours, 
  shiftsInView, 
  getShiftPosition,
  onSelectShift,
  onAddShift
}: ShiftCalendarGridProps) => {
  return (
    <div className="grid gap-px bg-muted overflow-auto rounded-md">
      {/* Header row with time and day names */}
      <div className={`grid ${viewMode === "day" ? "grid-cols-2" : "grid-cols-8"} gap-px bg-muted`}>
        <div className="bg-background py-3 px-2 text-center text-sm font-medium border-r">
          Orario
        </div>
        {daysInView.map((day) => (
          <div key={day.toISOString()} className="bg-background py-3 px-2 text-center text-sm font-medium">
            {format(day, viewMode === "day" ? "EEEE d MMMM yyyy" : "EEE d", { locale: it })}
          </div>
        ))}
      </div>

      {/* Time slots grid */}
      {hours.map((hour) => (
        <div key={hour} className={`grid ${viewMode === "day" ? "grid-cols-2" : "grid-cols-8"} gap-px bg-muted min-h-[60px]`}>
          {/* Time column */}
          <div className="bg-background px-2 py-2 text-right text-sm text-muted-foreground border-r">
            {hour.toString().padStart(2, '0')}:00
          </div>
          
          {/* Day columns */}
          {daysInView.map((day) => {
            const shiftsOfDay = shiftsInView.filter(s => 
              isSameDay(parseISO(s.shift_date), day)
            );
            
            return (
              <div
                key={`${day.toISOString()}-${hour}`}
                className="bg-background p-1 relative cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => onAddShift(day)}
              >
                {shiftsOfDay.map(shift => {
                  const position = getShiftPosition(shift);
                  
                  // Only show shift in this hour slot if it intersects with this hour
                  const shiftStartHour = shift.start_time ? parseInt(shift.start_time.split(':')[0]) : 0;
                  const shiftEndHour = shift.end_time ? parseInt(shift.end_time.split(':')[0]) : 24;
                  
                  if (hour >= shiftStartHour && hour < shiftEndHour) {
                    return (
                      <div
                        key={shift.id}
                        className="absolute inset-1 bg-primary/90 text-primary-foreground rounded p-1 text-xs cursor-pointer hover:bg-primary transition-colors z-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectShift(shift);
                        }}
                        style={{
                          top: hour === shiftStartHour ? '4px' : '0',
                          bottom: hour === shiftEndHour - 1 ? '4px' : '0'
                        }}
                      >
                        <div className="text-xs font-medium truncate">
                          {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time
                            ? `${shift.start_time.substring(0, 5)}-${shift.end_time.substring(0, 5)}`
                            : shift.shift_type === 'half_day'
                            ? shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio'
                            : shift.shift_type === 'full_day' ? 'Giornata'
                            : shift.shift_type === 'sick_leave' ? 'Malattia'
                            : 'Non disp.'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
