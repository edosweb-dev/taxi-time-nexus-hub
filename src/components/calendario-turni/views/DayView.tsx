import React from 'react';
import { format, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { Profile } from '@/lib/types';

interface DayViewProps {
  currentDate: Date;
  shifts: Shift[];
  employees: Profile[];
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function DayView({ currentDate, shifts, employees, onCreateShift, onEditShift }: DayViewProps) {
  // Ore della giornata (da 6:00 a 23:00)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  const dayShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.shift_date);
    return isSameDay(shiftDate, currentDate);
  });

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
        top: `${startPos * 80}px`,
        height: `${Math.max(duration * 80, 40)}px`
      };
    }
    
    // Per altri tipi di turno, mostra un blocco fisso in alto
    return {
      top: '10px',
      height: '60px'
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
      {/* Header giorno */}
      <div className="bg-muted/30 border-b p-4">
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
        </h3>
      </div>

      <div className="flex">
        {/* Colonna ore */}
        <div className="w-20 border-r bg-muted/30">
          {hours.map(hour => (
            <div key={hour} className="h-[80px] border-b flex items-start justify-center pt-2">
              <span className="text-sm text-muted-foreground font-medium">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Area principale */}
        <div className="flex-1 relative">
          {/* Griglia ore */}
          <div 
            className="cursor-pointer"
            onClick={() => onCreateShift(currentDate)}
          >
            {hours.map(hour => (
              <div 
                key={hour} 
                className="h-[80px] border-b hover:bg-accent/20 transition-colors"
              />
            ))}
          </div>

          {/* Turni del giorno */}
          {dayShifts.map((shift, index) => {
            const user = getUserInfo(shift.user_id);
            const userColor = user?.color || '#6B7280';
            const position = getShiftPosition(shift);

            return (
              <div
                key={shift.id}
                className="absolute left-4 p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all z-10"
                style={{ 
                  backgroundColor: userColor,
                  color: 'white',
                  ...position,
                  width: `calc(${100 / Math.max(dayShifts.length, 1)}% - 32px)`,
                  marginLeft: `${4 + (index * (100 / dayShifts.length))}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditShift(shift);
                }}
              >
                <div className="font-semibold mb-1">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-sm opacity-90">
                  {getShiftTypeLabel(shift)}
                </div>
                {shift.notes && (
                  <div className="text-xs opacity-75 mt-1 truncate">
                    {shift.notes}
                  </div>
                )}
              </div>
            );
          })}

          {/* Messaggio se non ci sono turni */}
          {dayShifts.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">Nessun turno programmato</p>
                <p className="text-sm">Clicca per aggiungere un nuovo turno</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}