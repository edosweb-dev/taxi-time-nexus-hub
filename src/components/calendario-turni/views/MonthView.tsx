import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday as isDateToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { Profile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  shifts: Shift[];
  employees: Profile[];
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function MonthView({ currentDate, shifts, employees, onCreateShift, onEditShift }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const getShiftsForDay = (date: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.shift_date);
      return isSameDay(shiftDate, date);
    });
  };

  const getUserInfo = (userId: string) => {
    return employees.find(emp => emp.id === userId);
  };

  const getShiftTypeLabel = (shift: Shift) => {
    switch (shift.shift_type) {
      case 'specific_hours':
        return shift.start_time && shift.end_time ? `${shift.start_time}-${shift.end_time}` : 'Orario specifico';
      case 'full_day':
        return 'Giornata intera';
      case 'half_day':
        return `Mezza giornata (${shift.half_day_type === 'morning' ? 'mattina' : 'pomeriggio'})`;
      case 'sick_leave':
        return 'Malattia';
      case 'unavailable':
        return 'Non disponibile';
      default:
        return shift.shift_type;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="min-h-full">
        {/* Header giorni della settimana - Migliorato */}
        <div className="grid grid-cols-7 border-b bg-gradient-to-r from-muted/50 to-muted/30 backdrop-blur-sm">
          {weekdays.map((day) => (
            <div key={day} className="p-4 text-center font-semibold text-sm text-foreground/80 border-r last:border-r-0 tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Griglia calendario - Design migliorato */}
        <div className="grid grid-cols-7 auto-rows-fr min-h-[500px] md:min-h-[600px] lg:min-h-[650px]">
          {calendarDays.map((date, index) => {
            const dayShifts = getShiftsForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isTodayDate = isDateToday(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={date.toISOString()}
                className={`
                  group relative min-h-[140px] md:min-h-[160px] p-3 border-r border-b last:border-r-0 cursor-pointer 
                  transition-all duration-200 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:z-10
                  ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground hover:bg-muted/30' : 'bg-background hover:bg-accent/30'}
                  ${isTodayDate ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/50 shadow-md' : ''}
                  ${isWeekend && isCurrentMonth ? 'bg-gradient-to-br from-muted/15 to-muted/5' : ''}
                `}
                onClick={() => onCreateShift(date)}
              >
                {/* Numero del giorno - Migliorato */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`
                    text-sm font-semibold transition-all duration-200
                    ${isTodayDate ? 
                      'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-pulse' : 
                      'w-8 h-8 flex items-center justify-center hover:bg-accent/50 rounded-full'
                    }
                  `}>
                    {format(date, 'd')}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Plus className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors p-1 bg-background/80 rounded-full shadow-sm" />
                    </div>
                  )}
                </div>

                {/* Turni del giorno - Design moderno */}
                <div className="space-y-2">
                  {/* Container con layout migliorato */}
                  <div className="flex flex-wrap gap-1.5">
                    {dayShifts.slice(0, 8).map((shift) => {
                      const user = getUserInfo(shift.user_id);
                      const userColor = user?.color || '#6B7280';

                      return (
                        <div
                          key={shift.id}
                          className="group/shift relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditShift(shift);
                          }}
                        >
                          {/* Avatar migliorato */}
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer 
                                     transition-all duration-200 hover:scale-110 hover:shadow-lg shadow-sm border-2 border-white/50"
                            style={{ 
                              backgroundColor: userColor,
                              color: 'white'
                            }}
                            title={`${user?.first_name} ${user?.last_name} - ${getShiftTypeLabel(shift)}`}
                          >
                            {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                          </div>
                          
                          {/* Tooltip moderno on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover/shift:opacity-100 
                                        transition-opacity duration-200 pointer-events-none z-20">
                            <div className="bg-popover border rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                              <div className="font-semibold">{user?.first_name} {user?.last_name}</div>
                              <div className="text-muted-foreground">{getShiftTypeLabel(shift)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Contatore turni aggiuntivi - Design moderno */}
                  {dayShifts.length > 8 && (
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-r from-muted to-muted/80 text-muted-foreground text-xs px-2 py-1 
                                    rounded-full border shadow-sm font-medium">
                        +{dayShifts.length - 8} altri
                      </div>
                    </div>
                  )}
                  
                  {/* Indicatore di oggi */}
                  {isTodayDate && dayShifts.length === 0 && (
                    <div className="flex items-center justify-center pt-2">
                      <div className="text-xs text-primary/70 font-medium bg-primary/10 px-2 py-1 rounded-full">
                        Oggi
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}