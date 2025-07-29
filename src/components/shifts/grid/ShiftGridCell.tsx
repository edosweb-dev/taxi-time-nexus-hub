import { Shift } from '../ShiftContext';
import { shiftTypeColors, shiftTypeLabels } from './ShiftGridLegend';
import { cn } from '@/lib/utils';
import { format, getDay } from 'date-fns';

interface ShiftGridCellProps {
  date: Date;
  shifts: Shift[];
  userId: string;
  onClick: (userId: string, date: Date) => void;
}

export function ShiftGridCell({ date, shifts, userId, onClick }: ShiftGridCellProps) {
  const dayOfWeek = getDay(date);
  const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const isWeekend = adjustedDayOfWeek >= 5;
  
  const handleClick = () => {
    onClick(userId, date);
  };

  return (
    <div
      className={cn(
        "border-r border-b border-gray-200 min-h-[80px] p-1 cursor-pointer hover:bg-accent/50 transition-colors",
        "flex flex-col gap-1",
        isWeekend && "bg-gray-50"
      )}
      onClick={handleClick}
    >
      {shifts.map((shift, index) => {
        const colorClass = shiftTypeColors[shift.shift_type as keyof typeof shiftTypeColors] || 'bg-gray-500 text-white';
        
        // Determina il testo da mostrare
        let displayText = '';
        if (shift.shift_type === 'specific_hours' && shift.start_time) {
          displayText = shift.start_time;
        } else if (shift.shift_type === 'half_day' && shift.half_day_type) {
          displayText = shift.half_day_type === 'morning' ? 'M' : 'P';
        } else {
          displayText = shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels]?.charAt(0) || 'T';
        }

        // Costruisce il tooltip
        let tooltip = shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels] || shift.shift_type;
        if (shift.shift_type === 'half_day' && shift.half_day_type) {
          tooltip += ` (${shift.half_day_type === 'morning' ? 'Mattino' : 'Pomeriggio'})`;
        }
        if (shift.start_time && shift.end_time) {
          tooltip += ` (${shift.start_time} - ${shift.end_time})`;
        }
        if (shift.notes) {
          tooltip += ` - ${shift.notes}`;
        }
        
        return (
          <div
            key={shift.id}
            className={cn(
              "text-xs px-2 py-1 rounded text-center font-medium",
              colorClass
            )}
            title={tooltip}
          >
            {displayText}
          </div>
        );
      })}
    </div>
  );
}