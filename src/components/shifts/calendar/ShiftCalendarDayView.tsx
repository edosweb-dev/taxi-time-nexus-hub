import { isSameDay, parseISO, format, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Shift } from '../types';
import { getUserColorClass } from '../filters/UserFilterDropdown';
import { getUserInitials, getUserDisplayName } from '../utils/userDisplayUtils';
import { useUsers } from '@/hooks/useUsers';

interface ShiftCalendarDayViewProps {
  daysInView: Date[];
  shifts: Shift[];
  isAdminOrSocio: boolean;
  onCellClick: (day: Date, userId: string | null) => void;
  onSelectShift: (shift: Shift) => void;
  userId: string | null;
}

export const ShiftCalendarDayView = ({
  daysInView,
  shifts,
  isAdminOrSocio,
  onCellClick,
  onSelectShift,
  userId
}: ShiftCalendarDayViewProps) => {
  const { users } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });
  
  const day = daysInView[0]; // Single day view
  const dayShifts = shifts.filter(s => {
    const shiftDate = parseISO(s.shift_date);
    return isSameDay(shiftDate, day);
  });
  
  return (
    <div className="bg-background border rounded-lg">
      {/* Day header */}
      <div className="bg-muted/40 py-4 px-6 border-b">
        <div className="text-center">
          <div className="text-sm font-medium text-muted-foreground">
            {format(day, 'EEEE', { locale: it })}
          </div>
          <div className={`text-2xl font-bold ${isToday(day) ? 'text-primary' : ''}`}>
            {format(day, 'd MMMM yyyy', { locale: it })}
          </div>
        </div>
      </div>
      
      {/* Day content */}
      <div 
        className="p-6 min-h-[400px] cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => onCellClick(day, userId)}
      >
        <div className="space-y-3">
          <h3 className="text-lg font-semibold mb-4">
            Turni del giorno ({dayShifts.length})
          </h3>
          
          <div className="grid gap-1 max-h-[350px] overflow-auto">
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
                  className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${userColor} p-2 min-h-[2.5rem] flex flex-col justify-center`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectShift(shift);
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    {/* Always show user info prominently */}
                    {isAdminOrSocio && (
                      <div className="font-bold text-xs leading-tight">
                        {userInitials} {userDisplay.length > 15 ? userDisplay.substring(0, 15) + '...' : userDisplay}
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
                className="text-xs text-muted-foreground text-center py-2 px-2 border border-dashed border-muted rounded cursor-pointer hover:border-primary hover:text-primary transition-colors"
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
      </div>
    </div>
  );
};