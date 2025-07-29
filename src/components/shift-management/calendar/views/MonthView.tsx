import { useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  shifts: Shift[];
  userMap: Map<string, any>;
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function MonthView({
  currentDate,
  shifts,
  userMap,
  onCreateShift,
  onEditShift
}: MonthViewProps) {
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
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

  const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  const getShiftDisplayText = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : 'U';
    
    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
      return `${initials} ${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}`;
    }
    
    return `${initials} ${getShiftTypeAbbr(shift.shift_type)}`;
  };

  const getShiftTypeAbbr = (type: string) => {
    switch (type) {
      case 'full_day': return 'FD';
      case 'half_day': return 'HD';
      case 'sick_leave': return 'ML';
      case 'unavailable': return 'ND';
      default: return 'T';
    }
  };

  const getShiftColor = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    return user?.color || '#3B82F6';
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr h-full">
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayShifts = shiftsByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={dateKey}
              className={cn(
                "border-r border-b last:border-r-0 p-2 min-h-[120px] group hover:bg-muted/20 transition-colors cursor-pointer",
                !isCurrentMonth && "bg-muted/10 text-muted-foreground"
              )}
              onClick={() => onCreateShift(day)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCurrentDay && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  )}
                >
                  {format(day, 'd')}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateShift(day);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Shifts */}
              <div className="flex flex-wrap gap-1">
                {dayShifts.map((shift) => {
                  const user = userMap.get(shift.user_id);
                  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}` : 'U';
                  
                  return (
                    <div
                      key={shift.id}
                      className="w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center text-[10px] font-medium text-white"
                      style={{
                        backgroundColor: getShiftColor(shift)
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditShift(shift);
                      }}
                    >
                      {initials}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}