import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay 
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { useUsers } from '@/hooks/useUsers';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileCalendarioGridProps {
  currentDate: Date;
  shifts: Shift[];
  isLoading: boolean;
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function MobileCalendarioGrid({ 
  currentDate, 
  shifts, 
  isLoading,
  onCreateShift, 
  onEditShift 
}: MobileCalendarioGridProps) {
  const { users } = useUsers();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const giorni = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getTurniPerGiorno = (giorno: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.shift_date);
      return isSameDay(shiftDate, giorno);
    });
  };

  const getUserInfo = (userId: string) => {
    return users?.find(user => user.id === userId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-7 gap-1">
              {[...Array(42)].map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mobile-calendario-grid">
      <CardContent className="p-4">
        {/* Header giorni settimana */}
        <div className="weekdays-header">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
            <div key={day} className="weekday-cell">
              {day}
            </div>
          ))}
        </div>

        {/* Grid giorni */}
        <div className="calendar-grid">
          {giorni.map((giorno) => {
            const turniGiorno = getTurniPerGiorno(giorno);
            const isCurrentMonth = isSameMonth(giorno, currentDate);
            const isCurrentDay = isToday(giorno);

            return (
              <TouchOptimizer key={giorno.toISOString()} minSize="lg">
                <div
                  className={`
                    calendar-day
                    ${!isCurrentMonth ? 'other-month' : ''}
                    ${isCurrentDay ? 'today' : ''}
                    ${turniGiorno.length > 0 ? 'has-turni' : ''}
                  `}
                  onClick={() => onCreateShift(giorno)}
                >
                  <div className="day-number">
                    {format(giorno, 'd')}
                  </div>
                  
                  {/* Turni indicators */}
                  {turniGiorno.length > 0 && (
                    <div className="turni-display">
                      {turniGiorno.length <= 3 ? (
                        // Show individual user avatars for 3 or fewer shifts
                        <div className="flex gap-1 flex-wrap justify-center">
                          {turniGiorno.map((turno) => {
                            const user = getUserInfo(turno.user_id);
                            return (
                              <div
                                key={turno.id}
                                className="user-dot"
                                style={{ backgroundColor: user?.color || '#6b7280' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditShift(turno);
                                }}
                                title={`${user?.first_name} ${user?.last_name}`}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        // Show count for more than 3 shifts
                        <div className="turni-count-badge">
                          {turniGiorno.length}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TouchOptimizer>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}