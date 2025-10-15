import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday as isDateToday, addDays } from 'date-fns';
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
  
  // Generate weeks that contain days of current month only
  const calendarWeeks = React.useMemo(() => {
    const weeks = [];
    let currentWeekStart = calendarStart;
    
    while (currentWeekStart <= calendarEnd) {
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        weekDays.push(addDays(currentWeekStart, i));
      }
      
      // Include only weeks that have at least one day of current month
      const hasCurrentMonthDay = weekDays.some(day => 
        isSameMonth(day, currentDate)
      );
      
      if (hasCurrentMonthDay) {
        weeks.push(weekDays);
      }
      
      currentWeekStart = addDays(currentWeekStart, 7);
    }
    
    return weeks;
  }, [currentDate, calendarStart, calendarEnd]);

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
      case 'full_day':
        return 'Giornata intera';
      case 'half_day':
        return `Mezza giornata (${shift.half_day_type === 'morning' ? 'mattina' : 'pomeriggio'})`;
      case 'extra':
        return 'Extra';
      case 'unavailable':
        return 'Non disponibile';
      default:
        return shift.shift_type;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header giorni della settimana - Fixed */}
      <div className="flex-shrink-0 grid grid-cols-7 border-b bg-muted/30 sticky top-0 z-10">
        {weekdays.map((day) => (
          <div key={day} className="py-4 px-4 text-center font-semibold text-base text-foreground/80 border-r last:border-r-0 bg-muted/30">
            {day}
          </div>
        ))}
      </div>

      {/* Griglia calendario - settimane dinamiche con giorni del mese corrente */}
      <div className="flex-1 grid gap-0" style={{ gridTemplateRows: `repeat(${calendarWeeks.length}, 1fr)` }}>
        {calendarWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-0">
            {week.map((date, dayIndex) => {
              const dayShifts = getShiftsForDay(date);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isTodayDate = isDateToday(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={date.toISOString()}
                  className={`
                    group relative p-4 border-r border-b cursor-pointer 
                    transition-all duration-200 ease-in-out hover:bg-accent/50 hover:shadow-sm
                    h-full flex flex-col min-h-[120px]
                    ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground hover:bg-muted/30' : 'bg-background'}
                    ${isTodayDate ? 'bg-primary/8 border-primary/30' : ''}
                    ${isWeekend && isCurrentMonth ? 'bg-muted/8' : ''}
                  `}
                  onClick={() => onCreateShift(date)}
                >
                  {/* Numero del giorno */}
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className={`
                      text-base font-semibold transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-lg
                      ${isTodayDate ? 'bg-primary text-primary-foreground font-bold shadow-md' : 'hover:bg-accent/50'}
                    `}>
                      {format(date, 'd')}
                    </div>
                    
                    {isCurrentMonth && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Plus className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                      </div>
                    )}
                  </div>

                  {/* Turni del giorno */}
                  <div className="flex-1 min-h-0">
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
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer 
                                       transition-all duration-200 hover:scale-110 hover:shadow-lg border-2 border-white/50"
                              style={{ 
                                backgroundColor: userColor,
                                color: 'white'
                              }}
                              title={`${user?.first_name} ${user?.last_name} - ${getShiftTypeLabel(shift)}`}
                            >
                              {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Contatore per turni extra */}
                      {dayShifts.length > 8 && (
                        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center border-2 border-border">
                          +{dayShifts.length - 8}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}