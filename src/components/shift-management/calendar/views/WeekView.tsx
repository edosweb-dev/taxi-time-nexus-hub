import { useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  shifts: Shift[];
  userMap: Map<string, any>;
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function WeekView({
  currentDate,
  shifts,
  userMap,
  onCreateShift,
  onEditShift
}: WeekViewProps) {
  // Generate week days
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  // Group shifts by date
  const shiftsByDate = useMemo(() => {
    const grouped = new Map<string, Shift[]>();
    shifts.forEach(shift => {
      const dateKey = shift.shift_date;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(shift);
    });
    return grouped;
  }, [shifts]);

  const getShiftDisplayText = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Utente';
    
    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
      return `${userName} (${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)})`;
    }
    
    return `${userName} - ${getShiftTypeLabel(shift.shift_type)}`;
  };

  const getShiftTypeLabel = (type: string) => {
    switch (type) {
      case 'full_day': return 'Giornata intera';
      case 'half_day': return 'Mezza giornata';
      case 'sick_leave': return 'Malattia';
      case 'unavailable': return 'Non disponibile';
      case 'specific_hours': return 'Orario specifico';
      default: return 'Turno';
    }
  };

  const getShiftColor = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    return user?.color || '#3B82F6';
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map((day) => {
          const isCurrentDay = isToday(day);
          return (
            <div key={day.toISOString()} className="p-3 text-center border-r last:border-r-0">
              <div className="text-sm font-medium text-muted-foreground">
                {format(day, 'EEE', { locale: it })}
              </div>
              <div
                className={cn(
                  "text-lg font-bold mt-1",
                  isCurrentDay && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week content */}
      <div className="grid grid-cols-7 auto-rows-fr h-full">
        {weekDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayShifts = shiftsByDate.get(dateKey) || [];

          return (
            <div
              key={dateKey}
              className="border-r last:border-r-0 p-3 min-h-[300px] group hover:bg-muted/20 transition-colors cursor-pointer"
              onClick={() => onCreateShift(day)}
            >
              {/* Add shift button */}
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 h-6 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateShift(day);
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Aggiungi turno
              </Button>

              {/* Shifts */}
              <div className="space-y-2">
                {dayShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="text-sm p-2 rounded cursor-pointer hover:opacity-80 transition-opacity border-l-4"
                    style={{
                      backgroundColor: getShiftColor(shift) + '20',
                      borderLeftColor: getShiftColor(shift),
                      color: getShiftColor(shift)
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditShift(shift);
                    }}
                  >
                    <div className="font-medium">
                      {getShiftDisplayText(shift)}
                    </div>
                    {shift.notes && (
                      <div className="text-xs opacity-70 mt-1">
                        {shift.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}