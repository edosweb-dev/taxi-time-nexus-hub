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
  const dayShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.shift_date);
    return isSameDay(shiftDate, currentDate);
  });

  const getUserInfo = (userId: string) => {
    return employees.find(emp => emp.id === userId);
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Header giorno */}
      <div className="bg-muted/30 border-b p-3 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
        </h3>
      </div>

      {/* Area turni */}
      <div 
        className="p-3 md:p-6 cursor-pointer min-h-[300px] md:min-h-[400px] hover:bg-accent/20 transition-colors"
        onClick={() => onCreateShift(currentDate)}
      >
        {dayShifts.length > 0 ? (
          <div className="space-y-3">
            {dayShifts.map((shift) => {
              const user = getUserInfo(shift.user_id);
              const userColor = user?.color || '#6B7280';

              return (
                <div
                  key={shift.id}
                  className="flex items-center gap-4 p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
                  style={{ 
                    backgroundColor: `${userColor}15`,
                    borderLeft: `4px solid ${shift.shift_type === 'extra' ? '#a855f7' : userColor}`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditShift(shift);
                  }}
                >
                  {/* Cerchio con iniziali */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold relative"
                    style={{ 
                      backgroundColor: userColor,
                      color: 'white'
                    }}
                  >
                    {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                    {shift.shift_type === 'extra' && (
                      <span className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        E
                      </span>
                    )}
                  </div>
                  
                  {/* Informazioni dipendente */}
                  <div className="flex-1">
                    <div className="font-semibold text-lg flex items-center gap-2" style={{ color: userColor }}>
                      {user?.first_name} {user?.last_name}
                      {shift.shift_type === 'extra' && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded font-bold">
                          EXTRA
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user?.role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="text-xl mb-2">Nessun turno programmato</p>
              <p className="text-sm">Clicca per aggiungere un nuovo turno</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}