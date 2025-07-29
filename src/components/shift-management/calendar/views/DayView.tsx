import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Clock, User } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  shifts: Shift[];
  userMap: Map<string, any>;
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function DayView({
  currentDate,
  shifts,
  userMap,
  onCreateShift,
  onEditShift
}: DayViewProps) {
  // Filter shifts for current date
  const dayShifts = useMemo(() => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    return shifts.filter(shift => shift.shift_date === dateKey);
  }, [shifts, currentDate]);

  // Group shifts by time
  const shiftsByTime = useMemo(() => {
    const sorted = [...dayShifts].sort((a, b) => {
      if (a.start_time && b.start_time) {
        return a.start_time.localeCompare(b.start_time);
      }
      if (a.start_time) return -1;
      if (b.start_time) return 1;
      return 0;
    });
    return sorted;
  }, [dayShifts]);

  const getShiftDisplayText = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Utente';
    
    return userName;
  };

  const getShiftTypeLabel = (shift: Shift) => {
    switch (shift.shift_type) {
      case 'full_day': return 'Giornata intera';
      case 'half_day': return `Mezza giornata (${shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio'})`;
      case 'sick_leave': return 'Malattia';
      case 'unavailable': return 'Non disponibile';
      case 'specific_hours': return `${shift.start_time?.slice(0, 5)} - ${shift.end_time?.slice(0, 5)}`;
      default: return 'Turno';
    }
  };

  const getShiftColor = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    return user?.color || '#3B82F6';
  };

  const isCurrentDay = isToday(currentDate);

  return (
    <div className="flex-1 overflow-hidden p-4">
      {/* Day header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn(
              "text-2xl font-bold",
              isCurrentDay && "text-primary"
            )}>
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h2>
            {isCurrentDay && (
              <p className="text-sm text-muted-foreground">Oggi</p>
            )}
          </div>
          
          <Button onClick={() => onCreateShift(currentDate)} className="gap-2">
            <Plus className="h-4 w-4" />
            Aggiungi turno
          </Button>
        </div>
      </div>

      {/* Shifts list */}
      <div className="space-y-4">
        {shiftsByTime.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessun turno programmato</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Non ci sono turni programmati per questo giorno.
              </p>
              <Button onClick={() => onCreateShift(currentDate)} className="gap-2">
                <Plus className="h-4 w-4" />
                Aggiungi il primo turno
              </Button>
            </CardContent>
          </Card>
        ) : (
          shiftsByTime.map((shift) => (
            <Card
              key={shift.id}
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
              style={{ borderLeftColor: getShiftColor(shift) }}
              onClick={() => onEditShift(shift)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getShiftColor(shift) }}
                    />
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {getShiftDisplayText(shift)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {getShiftTypeLabel(shift)}
                  </div>
                </CardTitle>
              </CardHeader>
              
              {shift.notes && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> {shift.notes}
                  </p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}