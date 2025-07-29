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
        "relative border-r border-b border-gray-200 min-h-[70px] p-2 cursor-pointer transition-all duration-200",
        "hover:bg-primary/5 hover:shadow-sm hover:border-primary/20",
        "flex flex-col gap-1.5",
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
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Plus className="h-4 w-4 opacity-40 group-hover:opacity-70 transition-opacity" />
            <span className="text-xs opacity-60 group-hover:opacity-80 transition-opacity">
              Aggiungi
            </span>
          </div>
        </div>
      ) : (
        <>
          {shifts.map((shift, index) => {
            const colorClass = shiftTypeColors[shift.shift_type as keyof typeof shiftTypeColors] || 'bg-gray-500 text-white';
            
            // Determina il testo da mostrare
            let displayText = '';
            if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
              displayText = `${shift.start_time}-${shift.end_time}`;
            } else if (shift.shift_type === 'half_day' && shift.half_day_type) {
              displayText = shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio';
            } else {
              displayText = shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels] || 'Turno';
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
                  "text-xs px-2 py-1 rounded-md text-center font-medium shadow-sm",
                  "border border-white/20",
                  colorClass
                )}
                title={tooltip}
              >
                {displayText}
              </div>
            );
          })}
          
          {/* Multiple shifts indicator */}
          {shifts.length > 1 && (
            <div className="absolute bottom-1 right-1">
              <div className="w-2 h-2 bg-primary rounded-full opacity-60"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}