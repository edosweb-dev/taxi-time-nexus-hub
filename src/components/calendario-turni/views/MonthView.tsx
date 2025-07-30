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
    <div className="flex-1 overflow-auto">
      <div className="min-h-full">
        {/* Header giorni della settimana */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {weekdays.map((day) => (
            <div key={day} className="p-3 text-center font-medium text-sm text-muted-foreground border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Griglia calendario */}
        <div className="grid grid-cols-7 auto-rows-fr min-h-[500px]">
          {calendarDays.map((date, index) => {
            const dayShifts = getShiftsForDay(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isTodayDate = isDateToday(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={date.toISOString()}
                className={`
                  min-h-[120px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-accent/50 transition-colors
                  ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                  ${isTodayDate ? 'bg-primary/5 border-primary' : ''}
                  ${isWeekend && isCurrentMonth ? 'bg-muted/10' : ''}
                `}
                onClick={() => onCreateShift(date)}
              >
                {/* Numero del giorno */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    text-sm font-medium
                    ${isTodayDate ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}
                  `}>
                    {format(date, 'd')}
                  </span>
                  
                  {isCurrentMonth && (
                    <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity" />
                  )}
                </div>

                {/* Turni del giorno */}
                <div className="space-y-1">
                  {/* Flex container per affiancare i turni */}
                  <div className="flex flex-wrap gap-1">
                    {dayShifts.slice(0, 12).map((shift) => {
                      const user = getUserInfo(shift.user_id);
                      const userColor = user?.color || '#6B7280';

                      return (
                        <div
                          key={shift.id}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                          style={{ 
                            backgroundColor: userColor,
                            color: 'white'
                          }}
                          title={`${user?.first_name} ${user?.last_name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditShift(shift);
                          }}
                        >
                          {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                        </div>
                      );
                    })}
                  </div>
                  
                  {dayShifts.length > 12 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayShifts.length - 12} altri
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