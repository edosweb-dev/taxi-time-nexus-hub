import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '@/components/shifts/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <div className="mb-6">
        {/* Time slot header */}
        <div className="flex items-center mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <span className="text-sm text-muted-foreground">({shifts.length})</span>
          </div>
          <div className="flex-1 ml-3 h-px bg-border"></div>
        </div>
        
        {/* Full-width shift bars */}
        <div className="space-y-2">
          {shifts.map((shift) => {
            const shiftInfo = getShiftTypeInfo(shift);
            const ShiftIcon = shiftInfo.icon;
            
            return (
              <Card
                key={shift.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4"
                style={{ borderLeftColor: getShiftColor(shift) }}
                onClick={() => onEditShift(shift)}
              >
                <CardContent className="p-4">
                  {/* Desktop Layout - Horizontal */}
                  <div className="hidden md:flex items-center justify-between">
                    {/* Left section - Employee */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: getShiftColor(shift) }}
                      >
                        {getUserInitials(shift)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{getShiftDisplayText(shift)}</h3>
                        <div className="flex items-center gap-1">
                          <ShiftIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{shiftInfo.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Center section - Time details */}
                    <div className="flex-1 mx-6">
                      {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time ? (
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">{shift.start_time.slice(0, 5)}</p>
                            <p className="text-xs text-muted-foreground">Inizio</p>
                          </div>
                          <div className="w-12 h-0.5 bg-border relative">
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-muted-foreground rounded-full"></div>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-foreground">{shift.end_time.slice(0, 5)}</p>
                            <p className="text-xs text-muted-foreground">Fine</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Badge variant={shiftInfo.variant} className="gap-1">
                            <ShiftIcon className="h-3 w-3" />
                            {shiftInfo.label}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Right section - Notes and actions */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {shift.notes && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            Note
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout - Vertical */}
                  <div className="md:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: getShiftColor(shift) }}
                        >
                          {getUserInitials(shift)}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{getShiftDisplayText(shift)}</h3>
                        </div>
                      </div>
                      {shift.notes && (
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Note
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant={shiftInfo.variant} className="gap-1">
                        <ShiftIcon className="h-3 w-3" />
                        {shiftInfo.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Notes section */}
                  {shift.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        {shift.notes}
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
      {/* Day header */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn(
              "text-lg font-medium",
              isCurrentDay && "text-primary"
            )}>
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              {isCurrentDay && (
                <Badge variant="default" className="text-xs h-5">
                  Oggi
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {totalShifts} {totalShifts === 1 ? 'turno' : 'turni'}
              </span>
            </div>
          </div>
          
          <Button onClick={() => onCreateShift(currentDate)} size="sm" className="gap-1">
            <Plus className="h-3 w-3" />
            Aggiungi turno
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Shifts content */}
        {totalShifts === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-muted rounded-full p-3 mb-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium mb-1">Nessun turno programmato</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Non ci sono turni programmati per questo giorno.
              </p>
              <Button onClick={() => onCreateShift(currentDate)} size="sm" className="gap-1">
                <Plus className="h-3 w-3" />
                Aggiungi il primo turno
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
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