import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shift, User } from '@/types/shifts';
import { cn } from '@/lib/utils';

interface ShiftCalendarProps {
  shifts: Shift[];
  users: User[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onCreateShift?: (date: Date) => void;
  onEditShift?: (shift: Shift) => void;
}

const shiftTypeColors = {
  work: 'bg-green-100 text-green-800 border-green-200',
  sick_leave: 'bg-red-100 text-red-800 border-red-200',
  vacation: 'bg-blue-100 text-blue-800 border-blue-200',
  unavailable: 'bg-gray-100 text-gray-800 border-gray-200'
};

const shiftTypeLabels = {
  work: 'Lavoro',
  sick_leave: 'Malattia',
  vacation: 'Ferie',
  unavailable: 'Non disponibile'
};

export function ShiftCalendar({ 
  shifts, 
  users, 
  currentDate, 
  onDateChange, 
  onCreateShift,
  onEditShift 
}: ShiftCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const shiftsByDate = useMemo(() => {
    const grouped: Record<string, Shift[]> = {};
    shifts.forEach(shift => {
      const dateKey = shift.shift_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(shift);
    });
    return grouped;
  }, [shifts]);

  const getUserColor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.color || '#3B82F6';
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Utente sconosciuto';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayShifts = shiftsByDate[dateKey] || [];
    
    if (dayShifts.length === 1 && onEditShift) {
      onEditShift(dayShifts[0]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy', { locale: it })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {onCreateShift && (
            <Button size="sm" onClick={() => onCreateShift(new Date())}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo turno
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
            <div key={day} className="text-center font-medium text-sm p-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(date => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayShifts = shiftsByDate[dateKey] || [];
            const dayOfWeek = getDay(date);
            
            return (
              <div
                key={dateKey}
                className={cn(
                  'min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
                  isToday(date) && 'bg-blue-50 border-blue-200',
                  !isSameMonth(date, currentDate) && 'text-gray-400',
                  selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateKey && 'ring-2 ring-blue-500'
                )}
                onClick={() => handleDayClick(date)}
              >
                <div className="text-sm font-medium mb-1">
                  {format(date, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayShifts.slice(0, 3).map(shift => {
                    const user = users.find(u => u.id === shift.user_id);
                    return (
                      <div
                        key={shift.id}
                        className={cn(
                          'text-xs p-1 rounded border text-center truncate',
                          shiftTypeColors[shift.shift_type]
                        )}
                        style={{
                          borderLeftColor: user?.color || '#3B82F6',
                          borderLeftWidth: '3px'
                        }}
                        title={`${getUserName(shift.user_id)} - ${shiftTypeLabels[shift.shift_type]} ${shift.start_time && shift.end_time ? `(${shift.start_time}-${shift.end_time})` : ''}`}
                      >
                        {user?.first_name || 'N/A'}
                        {shift.shift_type === 'work' && shift.start_time && (
                          <div className="text-xs opacity-75">
                            {shift.start_time}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {dayShifts.length > 3 && (
                    <div className="text-xs text-center text-gray-500">
                      +{dayShifts.length - 3} altri
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(shiftTypeColors).map(([type, colorClass]) => (
            <Badge
              key={type}
              variant="outline"
              className={cn('text-xs', colorClass)}
            >
              {shiftTypeLabels[type as keyof typeof shiftTypeLabels]}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}