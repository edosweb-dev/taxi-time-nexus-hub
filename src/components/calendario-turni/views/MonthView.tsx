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
    <div className="flex-1 overflow-auto bg-background h-full">
      <div className="h-full flex flex-col">
        {/* Header giorni della settimana - Compatto */}
        <div className="grid grid-cols-7 border-b bg-muted/30 flex-shrink-0">
          {weekdays.map((day) => (
            <div key={day} className="py-2 px-3 text-center font-semibold text-sm text-foreground/80 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Griglia calendario - Uso massimo spazio */}
        <div className="grid grid-cols-7 auto-rows-fr flex-1 min-h-0">
          {calendarDays.map((date, index) => {
            const dayShifts = getShiftsForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isTodayDate = isDateToday(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={date.toISOString()}
                className={`
                  group relative p-2 border-r border-b last:border-r-0 cursor-pointer 
                  transition-all duration-200 ease-in-out hover:bg-accent/50 hover:shadow-sm
                  ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground hover:bg-muted/30' : 'bg-background'}
                  ${isTodayDate ? 'bg-primary/8 border-primary/30' : ''}
                  ${isWeekend && isCurrentMonth ? 'bg-muted/8' : ''}
                `}
                onClick={() => onCreateShift(date)}
              >
                {/* Numero del giorno - Compatto */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`
                    text-sm font-medium transition-all duration-200 w-6 h-6 flex items-center justify-center rounded-md
                    ${isTodayDate ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-accent/50'}
                  `}>
                    {format(date, 'd')}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Plus className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </div>
                  )}
                </div>

                {/* Turni del giorno - Layout compatto */}
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1">{dayShifts.slice(0, 6).map((shift) => {
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
                          {/* Avatar compatto */}
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer 
                                     transition-all duration-200 hover:scale-110 border border-white/20"
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
                  </div>
                  
                  {/* Contatore compatto */}
                  {dayShifts.length > 6 && (
                    <div className="text-xs text-muted-foreground text-center bg-muted/50 px-1 py-0.5 rounded">
                      +{dayShifts.length - 6}
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