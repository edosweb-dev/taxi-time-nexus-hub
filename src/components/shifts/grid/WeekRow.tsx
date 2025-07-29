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
      <div className="grid grid-cols-7 bg-muted/30 border-b">
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
                "px-1 py-1.5 text-center border-r border-gray-200 last:border-r-0",
                "flex items-center justify-center gap-1 min-h-[28px]",
                isWeekend && "bg-muted/50",
                todayCheck && "bg-primary text-primary-foreground font-bold",
                !isCurrentMonth && "opacity-50"
              )}
            >
              <div className="text-[10px] font-medium opacity-80">
                {weekDays[adjustedDayOfWeek]}
              </div>
              <div className={cn(
                "text-xs font-bold",
                todayCheck && "bg-primary-foreground text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
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
                "border-r border-gray-200 last:border-r-0 min-h-[80px] p-1 cursor-pointer transition-all duration-200",
                "hover:bg-primary/5 hover:shadow-sm",
                "flex flex-col gap-0.5",
                isWeekend && "bg-gray-50/30",
                !isCurrentMonth && "opacity-50"
              )}
              onClick={(e) => handleCellClick(day, e)}
            >
              {dayShifts.length === 0 ? (
                <div className="flex items-center justify-center h-full group">
                  <Plus className="h-3 w-3 opacity-20 group-hover:opacity-50 transition-opacity" />
                </div>
              ) : (
                <>
                  {dayShifts.slice(0, 5).map((shift, shiftIndex) => {
                    // Use employee color instead of shift type color
                    const userColor = shift.user.color || '#3B82F6';
                    const colorStyle = {
                      backgroundColor: userColor + '15', // Less transparency for better visibility
                      borderColor: userColor,
                      color: userColor
                    };
                    
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
                          "text-[10px] px-1 py-0.5 rounded text-center font-medium leading-none",
                          "border border-current truncate"
                        )}
                        style={colorStyle}
                        title={tooltip}
                      >
                        {displayText}
                      </div>
                    );
                  })}
                  
                  {/* Indicator per turni multipli */}
                  {dayShifts.length > 5 && (
                    <div className="text-[9px] text-center text-muted-foreground leading-none">
                      +{dayShifts.length - 5}
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