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
  onShiftClick: (shift: Shift) => void;
  currentMonth: Date;
}

export function WeekRow({ week, getShiftsForDate, onCellClick, onShiftClick, currentMonth }: WeekRowProps) {
  const weekDays = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  
  const handleCellClick = (day: Date, event: React.MouseEvent) => {
    event.preventDefault();
    const isDoubleClick = event.detail === 2;
    onCellClick(day, isDoubleClick);
  };

  return (
    <div className="border-b border-gray-200">
      {/* Week Header */}
      <div className="grid grid-cols-7 bg-muted/40 border-b sticky top-0 z-30">
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
                "px-2 py-3 text-center border-r border-gray-200 last:border-r-0",
                "flex flex-col items-center justify-center gap-1",
                isWeekend && "bg-muted/60",
                todayCheck && "bg-primary text-primary-foreground font-bold",
                !isCurrentMonth && "opacity-50"
              )}
            >
              <div className="text-xs font-medium uppercase tracking-wide">
                {weekDays[adjustedDayOfWeek]}
              </div>
              <div className={cn(
                "text-lg font-bold",
                todayCheck && "bg-primary-foreground text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm"
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
                "border-r border-gray-200 last:border-r-0 min-h-[100px] p-1.5",
                "flex flex-col",
                isWeekend && "bg-gray-50/50",
                !isCurrentMonth && "opacity-60"
              )}
            >
              {dayShifts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs text-muted-foreground/40">
                    Nessun turno
                  </div>
                </div>
              ) : (
                <>
                  {/* Griglia 2 colonne per i turni */}
                  <div className="grid grid-cols-2 gap-1 flex-1">
                    {dayShifts.slice(0, 6).map((shift, shiftIndex) => {
                      // Use employee color instead of shift type color
                      const userColor = shift.user.color || '#3B82F6';
                      const colorStyle = {
                        backgroundColor: userColor + '20', // Better visibility
                        borderColor: userColor,
                        color: userColor
                      };
                      
                      // Solo iniziali del dipendente
                      const userInitials = shift.user.first_name 
                        ? `${shift.user.first_name.charAt(0)}${shift.user.last_name?.charAt(0) || ''}` 
                        : 'U';
                      
                      // Testo del turno più compatto
                      let shiftInfo = '';
                      if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
                        shiftInfo = `${shift.start_time.slice(0,5)}-${shift.end_time.slice(0,5)}`;
                      } else if (shift.shift_type === 'half_day' && shift.half_day_type) {
                        shiftInfo = shift.half_day_type === 'morning' ? 'M' : 'P';
                      } else if (shift.shift_type === 'full_day') {
                        shiftInfo = 'FD';
                      } else if (shift.shift_type === 'sick_leave') {
                        shiftInfo = 'ML';
                      } else if (shift.shift_type === 'unavailable') {
                        shiftInfo = 'ND';
                      } else {
                        shiftInfo = 'T';
                      }

                      // Tooltip completo con nome per chiarezza
                      const fullName = `${shift.user.first_name || ''} ${shift.user.last_name || ''}`.trim() || 'Utente';
                      let tooltip = `${fullName} - ${shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels]}`;
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
                            "p-1 rounded border text-center text-xs relative z-5",
                            "hover:shadow-sm transition-shadow cursor-pointer hover:scale-105 hover:z-10"
                          )}
                          style={colorStyle}
                          title={tooltip}
                          onClick={(e) => {
                            e.stopPropagation();
                            onShiftClick(shift);
                          }}
                        >
                          <div className="font-bold leading-tight">
                            {userInitials}
                          </div>
                          <div className="text-[10px] opacity-90 leading-tight">
                            {shiftInfo}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Indicator per turni multipli */}
                  {dayShifts.length > 6 && (
                    <div className="text-[10px] text-center text-muted-foreground bg-muted/50 rounded py-0.5 mt-1">
                      +{dayShifts.length - 6}
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