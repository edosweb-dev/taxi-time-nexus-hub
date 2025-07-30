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
      <div className="bg-muted/30 border-b p-6">
        <h3 className="text-xl font-semibold">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
        </h3>
      </div>

      {/* Area turni */}
      <div 
        className="p-6 cursor-pointer min-h-[400px] hover:bg-accent/20 transition-colors"
        onClick={() => onCreateShift(currentDate)}
      >
        {dayShifts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {dayShifts.map((shift) => {
              const user = getUserInfo(shift.user_id);
              const userColor = user?.color || '#6B7280';

              return (
                <div
                  key={shift.id}
                  className="p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all text-center"
                  style={{ 
                    backgroundColor: userColor,
                    color: 'white'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditShift(shift);
                  }}
                >
                  <div className="text-2xl font-bold mb-2">
                    {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-sm opacity-90">
                    {user?.first_name} {user?.last_name}
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