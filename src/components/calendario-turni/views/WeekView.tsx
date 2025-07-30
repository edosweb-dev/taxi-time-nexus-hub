import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday as isDateToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { Profile } from '@/lib/types';

interface WeekViewProps {
  currentDate: Date;
  shifts: Shift[];
  employees: Profile[];
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function WeekView({ currentDate, shifts, employees, onCreateShift, onEditShift }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getShiftsForDay = (date: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.shift_date);
      return isSameDay(shiftDate, date);
    });
  };

  const getUserInfo = (userId: string) => {
    return employees.find(emp => emp.id === userId);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7">
        {weekDays.map((date, dayIndex) => {
          const dayShifts = getShiftsForDay(date);
          const isCurrentDay = isDateToday(date);
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <div key={date.toISOString()} className="border-r last:border-r-0 min-h-[400px]">
              {/* Header giorno */}
              <div className={`
                h-16 border-b flex flex-col items-center justify-center p-2
                ${isCurrentDay ? 'bg-primary/5' : ''}
                ${isWeekend ? 'bg-muted/20' : ''}
              `}>
                <div className="text-xs text-muted-foreground font-medium">
                  {format(date, 'EEE', { locale: it })}
                </div>
                <div className={`
                  text-lg font-semibold
                  ${isCurrentDay ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center' : ''}
                `}>
                  {format(date, 'd')}
                </div>
              </div>

              {/* Area turni */}
              <div 
                className="p-2 cursor-pointer min-h-[300px] hover:bg-accent/20 transition-colors"
                onClick={() => onCreateShift(date)}
              >
                {/* Flex container per affiancare i turni */}
                <div className="flex flex-wrap gap-1">
                  {dayShifts.slice(0, 20).map((shift) => {
                    const user = getUserInfo(shift.user_id);
                    const userColor = user?.color || '#6B7280';

                    return (
                      <div
                        key={shift.id}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
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
                
                {dayShifts.length > 20 && (
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    +{dayShifts.length - 20} altri
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}