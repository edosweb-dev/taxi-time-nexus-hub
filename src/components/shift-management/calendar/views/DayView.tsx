import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Clock, User, Calendar, Briefcase, Heart, UserX, Coffee } from 'lucide-react';

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

  // Group shifts by time and type
  const groupedShifts = useMemo(() => {
    const groups = {
      morning: [] as Shift[],
      afternoon: [] as Shift[],
      fullDay: [] as Shift[],
      other: [] as Shift[]
    };

    dayShifts.forEach(shift => {
      if (shift.shift_type === 'full_day') {
        groups.fullDay.push(shift);
      } else if (shift.shift_type === 'half_day') {
        if (shift.half_day_type === 'morning') {
          groups.morning.push(shift);
        } else {
          groups.afternoon.push(shift);
        }
      } else if (shift.shift_type === 'specific_hours' && shift.start_time) {
        const hour = parseInt(shift.start_time.split(':')[0]);
        if (hour < 14) {
          groups.morning.push(shift);
        } else {
          groups.afternoon.push(shift);
        }
      } else {
        groups.other.push(shift);
      }
    });

    // Sort within each group
    Object.keys(groups).forEach(key => {
      groups[key as keyof typeof groups].sort((a, b) => {
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        return 0;
      });
    });

    return groups;
  }, [dayShifts]);

  const getShiftDisplayText = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Utente';
    return userName;
  };

  const getShiftTypeInfo = (shift: Shift) => {
    switch (shift.shift_type) {
      case 'full_day': 
        return { label: 'Giornata intera', icon: Calendar, variant: 'default' as const };
      case 'half_day': 
        return { 
          label: shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio', 
          icon: shift.half_day_type === 'morning' ? Coffee : Briefcase, 
          variant: 'secondary' as const 
        };
      case 'sick_leave': 
        return { label: 'Malattia', icon: Heart, variant: 'destructive' as const };
      case 'unavailable': 
        return { label: 'Non disponibile', icon: UserX, variant: 'outline' as const };
      case 'specific_hours': 
        return { 
          label: `${shift.start_time?.slice(0, 5)} - ${shift.end_time?.slice(0, 5)}`, 
          icon: Clock, 
          variant: 'default' as const 
        };
      default: 
        return { label: 'Turno', icon: Briefcase, variant: 'default' as const };
    }
  };

  const getShiftColor = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    return user?.color || '#3B82F6';
  };

  const getUserInitials = (shift: Shift) => {
    const user = userMap.get(shift.user_id);
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
  };

  const isCurrentDay = isToday(currentDate);
  const totalShifts = dayShifts.length;

  const renderShiftGroup = (title: string, shifts: Shift[], icon: any) => {
    if (shifts.length === 0) return null;

    const Icon = icon;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4" />
          {title} ({shifts.length})
        </div>
        <div className="grid gap-3">
          {shifts.map((shift) => {
            const shiftInfo = getShiftTypeInfo(shift);
            const ShiftIcon = shiftInfo.icon;
            
            return (
              <Card
                key={shift.id}
                className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] border-l-4 group"
                style={{ borderLeftColor: getShiftColor(shift) }}
                onClick={() => onEditShift(shift)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* User Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                        style={{ backgroundColor: getShiftColor(shift) }}
                      >
                        {getUserInitials(shift)}
                      </div>
                      
                      {/* Shift Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{getShiftDisplayText(shift)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={shiftInfo.variant} className="gap-1">
                            <ShiftIcon className="h-3 w-3" />
                            {shiftInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes indicator */}
                    {shift.notes && (
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        Con note
                      </div>
                    )}
                  </div>
                  
                  {shift.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Note:</span> {shift.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Enhanced Day header with stats */}
      <div className="bg-gradient-to-r from-background to-muted/20 p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className={cn(
              "text-3xl font-bold tracking-tight",
              isCurrentDay && "text-primary"
            )}>
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {isCurrentDay && (
                <Badge variant="default" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  Oggi
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {totalShifts} {totalShifts === 1 ? 'turno' : 'turni'}
              </span>
            </div>
          </div>
          
          <Button onClick={() => onCreateShift(currentDate)} size="lg" className="gap-2 shadow-lg">
            <Plus className="h-4 w-4" />
            Aggiungi turno
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Shifts content */}
        {totalShifts === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nessun turno programmato</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Non ci sono turni programmati per questo giorno. Inizia aggiungendo il primo turno.
              </p>
              <Button onClick={() => onCreateShift(currentDate)} size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Aggiungi il primo turno
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {renderShiftGroup("Giornata intera", groupedShifts.fullDay, Calendar)}
            {renderShiftGroup("Mattina", groupedShifts.morning, Coffee)}
            {renderShiftGroup("Pomeriggio", groupedShifts.afternoon, Briefcase)}
            {renderShiftGroup("Altri turni", groupedShifts.other, Clock)}
          </div>
        )}
      </div>
    </div>
  );
}