
import { isSameMonth, isToday, isSameDay, parseISO, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Shift } from '../types';
import { getUserColorClass } from '../filters/UserFilterDropdown';
import { useUsers } from '@/hooks/useUsers';

interface ShiftCalendarMonthViewProps {
  daysInView: Date[];
  currentMonth: Date;
  shifts: Shift[];
  isAdminOrSocio: boolean;
  onCellClick: (day: Date, userId: string | null) => void;
  onSelectShift: (shift: Shift) => void;
  userId: string | null;
}

export const ShiftCalendarMonthView = ({
  daysInView,
  currentMonth,
  shifts,
  isAdminOrSocio,
  onCellClick,
  onSelectShift,
  userId
}: ShiftCalendarMonthViewProps) => {
  const { users } = useUsers();
  
  return (
    <div className="grid grid-cols-7 gap-px bg-muted">
      {/* Weekday headers */}
      {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
        <div key={day} className="bg-background py-2 text-center text-sm font-medium">
          {day}
        </div>
      ))}
      
      {/* Month grid */}
      {daysInView.map((day) => {
        const dayShifts = shifts.filter(s => {
          const shiftDate = parseISO(s.shift_date);
          return isSameDay(shiftDate, day);
        });
        const isCurrentMonth = isSameMonth(day, currentMonth);
        const isCurrentDay = isToday(day);
        
        return (
          <div
            key={day.toISOString()}
            className={`min-h-[100px] bg-background p-1 ${
              isCurrentMonth ? '' : 'opacity-50'
            } ${isCurrentDay ? 'border border-primary' : ''}`}
            onClick={() => onCellClick(day, userId)}
          >
            <div className={`text-right text-sm mb-1 ${
              isCurrentDay ? 'font-bold text-primary' : ''
            }`}>
              {format(day, 'd')}
            </div>
            <div className="flex flex-col gap-1 overflow-auto max-h-[80px]">
              {dayShifts.map(shift => {
                const userColor = getUserColorClass(users, shift.user_id);
                
                return (
                  <Badge 
                    key={shift.id}
                    variant={
                      shift.shift_type === 'full_day' ? 'default' : 
                      shift.shift_type === 'half_day' ? 'secondary' :
                      shift.shift_type === 'sick_leave' ? 'destructive' :
                      shift.shift_type === 'unavailable' ? 'outline' : 'default'
                    }
                    className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${userColor}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectShift(shift);
                    }}
                  >
                    {isAdminOrSocio && (
                      <span className="font-medium mr-1">
                        {shift.user_first_name?.substring(0, 1)}.{shift.user_last_name?.substring(0, 1)}.
                      </span>
                    )}
                    {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time
                      ? `${shift.start_time.substring(0, 5)}-${shift.end_time.substring(0, 5)}`
                      : shift.shift_type === 'half_day'
                      ? shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio'
                      : shift.shift_type === 'full_day' ? 'Giornata intera'
                      : shift.shift_type === 'sick_leave' ? 'Malattia'
                      : 'Non disponibile'}
                  </Badge>
                );
              })}
              {dayShifts.length === 0 && isCurrentMonth && (
                <div 
                  className="text-xs text-muted-foreground text-center py-1 px-2 border border-dashed border-muted rounded cursor-pointer hover:border-primary hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCellClick(day, userId);
                  }}
                >
                  + Aggiungi turno
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
