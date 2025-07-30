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

  // Ore della giornata (da 6:00 a 23:00)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const getShiftsForDay = (date: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.shift_date);
      return isSameDay(shiftDate, date);
    });
  };

  const getUserInfo = (userId: string) => {
    return employees.find(emp => emp.id === userId);
  };

  const getShiftPosition = (shift: Shift) => {
    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
      const [startHour, startMinute] = shift.start_time.split(':').map(Number);
      const [endHour, endMinute] = shift.end_time.split(':').map(Number);
      
      const startPos = ((startHour - 6) * 60 + startMinute) / 60;
      const duration = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) / 60;
      
      return {
        top: `${startPos * 60}px`,
        height: `${Math.max(duration * 60, 30)}px`
      };
    }
    
    // Per altri tipi di turno, mostra un blocco fisso
    return {
      top: '0px',
      height: '40px'
    };
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
      <div className="flex">
        {/* Colonna ore */}
        <div className="w-16 border-r bg-muted/30">
          <div className="h-12 border-b"></div> {/* Spazio per header giorni */}
          {hours.map(hour => (
            <div key={hour} className="h-[60px] border-b flex items-start justify-center pt-1">
              <span className="text-xs text-muted-foreground font-medium">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Giorni della settimana */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((date, dayIndex) => {
            const dayShifts = getShiftsForDay(date);
            const isCurrentDay = isDateToday(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div key={date.toISOString()} className="border-r last:border-r-0">
                {/* Header giorno */}
                <div className={`
                  h-12 border-b flex flex-col items-center justify-center p-2
                  ${isCurrentDay ? 'bg-primary/5' : ''}
                  ${isWeekend ? 'bg-muted/20' : ''}
                `}>
                  <div className="text-xs text-muted-foreground font-medium">
                    {format(date, 'EEE', { locale: it })}
                  </div>
                  <div className={`
                    text-sm font-semibold
                    ${isCurrentDay ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' : ''}
                  `}>
                    {format(date, 'd')}
                  </div>
                </div>

                {/* Griglia ore del giorno */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => onCreateShift(date)}
                >
                  {/* Linee ore */}
                  {hours.map(hour => (
                    <div 
                      key={hour} 
                      className="h-[60px] border-b hover:bg-accent/20 transition-colors"
                    />
                  ))}

                  {/* Turni sovrapposti */}
                  {dayShifts.map((shift, index) => {
                    const user = getUserInfo(shift.user_id);
                    const userColor = user?.color || '#6B7280';
                    const position = getShiftPosition(shift);

                    return (
                      <div
                        key={shift.id}
                        className="absolute left-1 right-1 p-1 rounded text-xs cursor-pointer hover:shadow-md transition-all z-10"
                        style={{ 
                          backgroundColor: userColor,
                          color: 'white',
                          ...position,
                          marginLeft: `${index * 4}px`,
                          width: `calc(100% - ${index * 8}px)`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditShift(shift);
                        }}
                      >
                        <div className="font-medium truncate">
                          {user?.first_name} {user?.last_name}
                        </div>
                        <div className="text-xs opacity-90 truncate">
                          {getShiftTypeLabel(shift)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}