
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
    <div className="bg-background border rounded-md overflow-auto">
      <div className="flex">
        <ShiftTimeColumn hours={hours} />
        
        {/* Days columns - Full width for both day and week views */}
        <div className={`flex-1 flex ${viewMode === "day" ? "" : "divide-x"}`}>
          {daysInView.map((day) => {
            const shiftsOfDay = shiftsInView.filter(s => 
              isSameDay(parseISO(s.shift_date), day)
            );
            
            return (
              <ShiftDayColumn 
                key={day.toISOString()}
                day={day}
                shiftsOfDay={shiftsOfDay}
                getShiftPosition={getShiftPosition}
                onSelectShift={onSelectShift}
                onAddShift={() => onAddShift(day)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
