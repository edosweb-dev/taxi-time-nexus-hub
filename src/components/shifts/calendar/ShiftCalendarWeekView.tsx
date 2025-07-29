import { isSameDay, parseISO, format, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Shift } from '../types';
import { getUserColorClass } from '../filters/UserFilterDropdown';
import { getUserInitials, getUserDisplayName } from '../utils/userDisplayUtils';
import { useUsers } from '@/hooks/useUsers';

interface ShiftCalendarWeekViewProps {
  daysInView: Date[];
  shifts: Shift[];
  isAdminOrSocio: boolean;
  onCellClick: (day: Date, userId: string | null) => void;
  onSelectShift: (shift: Shift) => void;
  userId: string | null;
}

export const ShiftCalendarWeekView = ({
  daysInView,
  shifts,
  isAdminOrSocio,
  onCellClick,
  onSelectShift,
  userId
}: ShiftCalendarWeekViewProps) => {
  const { users } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });
  
  return (
    <div className="grid grid-cols-7 gap-px bg-muted">
      {/* Weekday headers */}
      {daysInView.map((day) => (
        <div key={day.toISOString()} className="bg-background py-3 text-center text-sm font-medium">
          <div className="font-semibold">
            {format(day, 'EEE', { locale: it })}
          </div>
          <div className={`text-lg ${isToday(day) ? 'font-bold text-primary' : ''}`}>
            {format(day, 'd')}
          </div>
        </div>
      ))}
      
      {/* Week grid */}
      {daysInView.map((day) => {
        const dayShifts = shifts.filter(s => {
          const shiftDate = parseISO(s.shift_date);
          return isSameDay(shiftDate, day);
        });
        const isCurrentDay = isToday(day);
        
        return (
          <div
            key={day.toISOString()}
            className={`min-h-[200px] bg-background p-3 cursor-pointer hover:bg-muted/30 transition-colors ${
              isCurrentDay ? 'border-2 border-primary' : ''
            }`}
            onClick={() => onCellClick(day, userId)}
          >
            <div className="flex flex-col gap-2 overflow-auto max-h-[180px]">
              {dayShifts.map(shift => {
                const userColor = getUserColorClass(users, shift.user_id);
                const userDisplay = getUserDisplayName(shift);
                const userInitials = getUserInitials(shift);
                
                return (
                  <Badge 
                    key={shift.id}
                    variant={
                      shift.shift_type === 'full_day' ? 'success' : 
                      shift.shift_type === 'half_day' ? 'secondary' :
                      shift.shift_type === 'sick_leave' ? 'destructive' :
                      shift.shift_type === 'unavailable' ? 'outline' : 'default'
                    }
                    className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${userColor} p-3 min-h-[3rem] flex flex-col justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectShift(shift);
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      {/* User info */}
                      {isAdminOrSocio && (
                        <div className="font-bold text-xs leading-tight">
                          {userInitials} {userDisplay.length > 12 ? userDisplay.substring(0, 12) + '...' : userDisplay}
                        </div>
                      )}
                      
                      {/* Shift type info */}
                      <div className="text-xs leading-tight">
                        {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time
                          ? `${shift.start_time.substring(0, 5)}-${shift.end_time.substring(0, 5)}`
                          : shift.shift_type === 'half_day'
                          ? shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio'
                          : shift.shift_type === 'full_day' ? 'Giornata intera'
                          : shift.shift_type === 'sick_leave' ? 'Malattia'
                          : 'Non disponibile'}
                      </div>
                    </div>
                  </Badge>
                );
              })}
              {dayShifts.length === 0 && (
                <div 
                  className="text-sm text-muted-foreground text-center py-4 px-3 border border-dashed border-muted rounded cursor-pointer hover:border-primary hover:text-primary transition-colors"
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