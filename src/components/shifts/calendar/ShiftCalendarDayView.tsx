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
          
          <div className="grid gap-3 max-h-[350px] overflow-auto">
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
                  className={`text-sm p-4 min-h-[4rem] flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity ${userColor}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectShift(shift);
                  }}
                >
                  <div className="flex flex-col gap-1">
                    {/* User info */}
                    {isAdminOrSocio && (
                      <div className="font-bold text-sm">
                        {userInitials} {userDisplay}
                      </div>
                    )}
                    
                    {/* Shift type info */}
                    <div className="text-sm">
                      {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time
                        ? `${shift.start_time.substring(0, 5)}-${shift.end_time.substring(0, 5)}`
                        : shift.shift_type === 'half_day'
                        ? shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio'
                        : shift.shift_type === 'full_day' ? 'Giornata intera'
                        : shift.shift_type === 'sick_leave' ? 'Malattia'
                        : 'Non disponibile'}
                    </div>
                    
                    {/* Notes if present */}
                    {shift.notes && (
                      <div className="text-xs opacity-75 mt-1">
                        {shift.notes.length > 50 ? shift.notes.substring(0, 50) + '...' : shift.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-right opacity-75">
                    {shift.shift_type === 'specific_hours' ? 'Orario specifico' :
                     shift.shift_type === 'half_day' ? 'Mezza giornata' :
                     shift.shift_type === 'full_day' ? 'Giornata intera' :
                     shift.shift_type === 'sick_leave' ? 'Malattia' : 'Non disponibile'}
                  </div>
                </Badge>
              );
            })}
            
            {dayShifts.length === 0 && (
              <div 
                className="text-center py-12 px-6 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:border-primary hover:bg-muted/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onCellClick(day, userId);
                }}
              >
                <div className="text-muted-foreground">
                  <div className="text-lg mb-2">Nessun turno programmato</div>
                  <div className="text-sm">+ Clicca per aggiungere un turno</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};