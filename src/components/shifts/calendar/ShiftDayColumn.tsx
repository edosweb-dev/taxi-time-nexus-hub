
import { format, isToday } from "date-fns";
import { it } from "date-fns/locale";
import { Shift } from "../types";
import { ShiftEvent } from "./ShiftEvent";

interface ShiftDayColumnProps {
  day: Date;
  shiftsOfDay: Shift[];
  getShiftPosition: (shift: Shift) => { top: number; height: number; spanRows: boolean };
  onSelectShift: (shift: Shift) => void;
  onAddShift: () => void;
}

export const ShiftDayColumn = ({ 
  day, 
  shiftsOfDay, 
  getShiftPosition, 
  onSelectShift,
  onAddShift
}: ShiftDayColumnProps) => {
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  const dayIsToday = isToday(day);

  return (
    <div className="flex-1 relative">
      {/* Day header */}
      <div className={`h-10 flex justify-center items-center border-b bg-muted/50 sticky top-0 z-20 
        ${dayIsToday ? "font-bold text-primary" : ""}`}
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
          onClick={onAddShift}
        />
      ))}
      
      {/* Empty state for no shifts */}
      {shiftsOfDay.length === 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={onAddShift}
        >
          <div className="text-xs text-muted-foreground text-center py-1 px-2 border border-dashed border-muted rounded hover:border-primary hover:text-primary transition-colors">
            + Aggiungi turno
          </div>
        </div>
      )}
      
      {/* Shifts for the day */}
      {shiftsOfDay.map(shift => {
        const { top, height, spanRows } = getShiftPosition(shift);
        return (
          <ShiftEvent
            key={shift.id}
            shift={shift}
            top={top}
            height={height}
            spanRows={spanRows}
            onClick={() => onSelectShift(shift)}
          />
        );
      })}
    </div>
  );
};
