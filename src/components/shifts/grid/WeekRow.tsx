import { WeekData, DayShifts } from './hooks/useShiftGrid';
import { Shift } from '../ShiftContext';
import { Profile } from '@/lib/types';
import { shiftTypeColors, shiftTypeLabels } from './ShiftGridLegend';
import { cn } from '@/lib/utils';
import { format, getDay, isToday, isSameMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { Plus } from 'lucide-react';

interface WeekRowProps {
  week: WeekData;
  getShiftsForDate: (date: Date) => Array<Shift & { user: Profile }>;
  onCellClick: (date: Date, isDoubleClick?: boolean) => void;
  currentMonth: Date;
}

export function WeekRow({ week, getShiftsForDate, onCellClick, currentMonth }: WeekRowProps) {
  const weekDays = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  
  const handleCellClick = (day: Date, event: React.MouseEvent) => {
    event.preventDefault();
    const isDoubleClick = event.detail === 2;
    onCellClick(day, isDoubleClick);
  };

  return (
    <div className="border-b border-gray-200">
      {/* Week Header */}
      <div className="grid grid-cols-7 bg-muted/50 border-b">
        {week.days.map((day, index) => {
          const dayOfWeek = getDay(day);
          const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const isWeekend = adjustedDayOfWeek >= 5;
          const todayCheck = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <div
              key={index}
              className={cn(
                "p-2 text-center border-r border-gray-200 last:border-r-0",
                "flex flex-col items-center justify-center min-h-[40px]",
                isWeekend && "bg-muted/70",
                todayCheck && "bg-primary text-primary-foreground font-bold",
                !isCurrentMonth && "opacity-50"
              )}
            >
              <div className="text-xs font-medium opacity-90">
                {weekDays[adjustedDayOfWeek]}
              </div>
              <div className={cn(
                "text-sm font-bold",
                todayCheck && "bg-primary-foreground text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Content */}
      <div className="grid grid-cols-7">
        {week.days.map((day, index) => {
          const dayShifts = getShiftsForDate(day);
          const dayOfWeek = getDay(day);
          const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const isWeekend = adjustedDayOfWeek >= 5;
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={index}
              className={cn(
                "border-r border-gray-200 last:border-r-0 min-h-[120px] p-2 cursor-pointer transition-all duration-200",
                "hover:bg-primary/5 hover:shadow-sm",
                "flex flex-col gap-1",
                isWeekend && "bg-gray-50/50",
                !isCurrentMonth && "opacity-50"
              )}
              onClick={(e) => handleCellClick(day, e)}
            >
              {dayShifts.length === 0 ? (
                <div className="flex items-center justify-center h-full group">
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <Plus className="h-4 w-4 opacity-30 group-hover:opacity-60 transition-opacity" />
                    <span className="text-xs opacity-50">Aggiungi</span>
                  </div>
                </div>
              ) : (
                <>
                  {dayShifts.slice(0, 4).map((shift, shiftIndex) => {
                    const colorClass = shiftTypeColors[shift.shift_type as keyof typeof shiftTypeColors] || 'bg-gray-500 text-white';
                    
                    // Testo compatto con nome dipendente
                    let displayText = '';
                    const userName = shift.user.first_name 
                      ? `${shift.user.first_name.charAt(0)}${shift.user.last_name?.charAt(0) || ''}` 
                      : 'U';
                    
                    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
                      displayText = `${userName} ${shift.start_time.slice(0,5)}-${shift.end_time.slice(0,5)}`;
                    } else if (shift.shift_type === 'half_day' && shift.half_day_type) {
                      displayText = `${userName} ${shift.half_day_type === 'morning' ? 'M' : 'P'}`;
                    } else if (shift.shift_type === 'full_day') {
                      displayText = `${userName} FD`;
                    } else if (shift.shift_type === 'sick_leave') {
                      displayText = `${userName} ML`;
                    } else if (shift.shift_type === 'unavailable') {
                      displayText = `${userName} ND`;
                    } else {
                      displayText = `${userName} T`;
                    }

                    // Tooltip completo
                    let tooltip = `${shift.user.first_name} ${shift.user.last_name} - ${shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels]}`;
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
                          "border border-white/20 truncate",
                          colorClass
                        )}
                        title={tooltip}
                      >
                        {displayText}
                      </div>
                    );
                  })}
                  
                  {/* Indicator per turni multipli */}
                  {dayShifts.length > 4 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{dayShifts.length - 4} altri
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}