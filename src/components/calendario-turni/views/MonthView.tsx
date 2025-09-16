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
      <div className="min-h-full flex flex-col">
        {/* Header giorni della settimana - Compatto */}
        <div className="grid grid-cols-7 border-b bg-muted/30 flex-shrink-0 sticky top-0 z-10">
          {weekdays.map((day) => (
            <div key={day} className="py-3 px-3 text-center font-semibold text-sm text-foreground/80 border-r last:border-r-0 bg-muted/30">
              {day}
            </div>
          ))}
        </div>

        {/* Griglia calendario - Righe con altezza minima e massima visibilità */}
        <div className="grid grid-cols-7" style={{ gridTemplateRows: `repeat(${Math.ceil(calendarDays.length / 7)}, minmax(120px, 1fr))` }}>
          {calendarDays.map((date, index) => {
            const dayShifts = getShiftsForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isTodayDate = isDateToday(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={date.toISOString()}
                className={`
                  group relative p-3 border-r border-b last:border-r-0 cursor-pointer 
                  transition-all duration-200 ease-in-out hover:bg-accent/50 hover:shadow-sm
                  min-h-[120px] flex flex-col
                  ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground hover:bg-muted/30' : 'bg-background'}
                  ${isTodayDate ? 'bg-primary/8 border-primary/30' : ''}
                  ${isWeekend && isCurrentMonth ? 'bg-muted/8' : ''}
                `}
                onClick={() => onCreateShift(date)}
              >
                {/* Numero del giorno - Più prominente */}
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <div className={`
                    text-sm font-medium transition-all duration-200 w-7 h-7 flex items-center justify-center rounded-lg
                    ${isTodayDate ? 'bg-primary text-primary-foreground font-semibold shadow-md' : 'hover:bg-accent/50'}
                  `}>
                    {format(date, 'd')}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Plus className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                    </div>
                  )}
                </div>

                {/* Turni del giorno - Layout ottimizzato con scroll */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="space-y-1">
                    {dayShifts.map((shift) => {
                      const user = getUserInfo(shift.user_id);
                      const userColor = user?.color || '#6B7280';

                      return (
                        <div
                          key={shift.id}
                          className="group/shift relative mb-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditShift(shift);
                          }}
                        >
                          {/* Badge turno completo */}
                          <div
                            className="w-full px-2 py-1 rounded-md text-xs font-medium cursor-pointer 
                                     transition-all duration-200 hover:shadow-sm hover:scale-[1.02] border border-white/20"
                            style={{ 
                              backgroundColor: userColor,
                              color: 'white'
                            }}
                            title={`${user?.first_name} ${user?.last_name} - ${getShiftTypeLabel(shift)}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate font-semibold">
                                {user?.first_name} {user?.last_name?.[0]}.
                              </span>
                              <span className="text-xs opacity-90 ml-1">
                                {shift.shift_type === 'specific_hours' && shift.start_time ? shift.start_time.substring(0, 5) : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}