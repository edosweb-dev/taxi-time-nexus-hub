import { Shift } from '../ShiftContext';
import { shiftTypeColors, shiftTypeLabels } from './ShiftGridLegend';
import { cn } from '@/lib/utils';
import { format, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Plus } from 'lucide-react';

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
  const hasShifts = shifts.length > 0;
  
  const handleClick = () => {
    onClick(userId, date);
  };

  return (
    <div
      className={cn(
        "relative border-r border-b border-gray-200 min-h-[35px] p-0.5 cursor-pointer transition-all duration-200",
        "hover:bg-primary/5 hover:shadow-sm hover:border-primary/20",
        "flex flex-col gap-0.5",
        isWeekend && "bg-gray-50/50",
        hasShifts && "bg-background"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Gestisci turni per ${format(date, 'd MMMM', { locale: it })}`}
    >
      {!hasShifts ? (
        <div className="flex items-center justify-center h-full group">
          <Plus className="h-2.5 w-2.5 opacity-30 group-hover:opacity-60 transition-opacity" />
        </div>
      ) : (
        <>
          {shifts.slice(0, 3).map((shift, index) => {
            // Use color from shift data (user_color) if available, otherwise default
            const userColor = shift.user_color || '#3B82F6';
            const colorStyle = {
              backgroundColor: userColor + '20', // Add transparency
              borderColor: userColor,
              color: userColor
            };
            
            // Testo compatto
            let displayText = '';
            if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
              displayText = `${shift.start_time.slice(0,5)}-${shift.end_time.slice(0,5)}`;
            } else if (shift.shift_type === 'half_day' && shift.half_day_type) {
              displayText = shift.half_day_type === 'morning' ? 'M' : 'P';
            } else if (shift.shift_type === 'full_day') {
              displayText = 'FD';
            } else if (shift.shift_type === 'sick_leave') {
              displayText = 'ML';
            } else if (shift.shift_type === 'unavailable') {
              displayText = 'ND';
            } else {
              displayText = 'T';
            }

            // Tooltip completo
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
                  "text-[9px] px-0.5 py-0.5 rounded text-center font-medium leading-none",
                  "border border-current"
                )}
                style={colorStyle}
                title={tooltip}
              >
                {displayText}
              </div>
            );
          })}
          
          {/* Indicator per turni multipli */}
          {shifts.length > 3 && (
            <div className="text-[8px] text-center text-muted-foreground leading-none">
              +{shifts.length - 3}
            </div>
          )}
        </>
      )}
    </div>
  );
}