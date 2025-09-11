import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Clock, User, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Shift } from '@/components/shifts/types';
import { useUsers } from '@/hooks/useUsers';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileDayViewProps {
  currentDate: Date;
  shifts: Shift[];
  isLoading: boolean;
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function MobileDayView({ 
  currentDate, 
  shifts, 
  isLoading, 
  onCreateShift, 
  onEditShift 
}: MobileDayViewProps) {
  const { users } = useUsers();

  const dayShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.shift_date);
    return isSameDay(shiftDate, currentDate);
  });

  const getUserInfo = (userId: string) => {
    return users?.find(user => user.id === userId);
  };

  const getShiftTypeLabel = (shift: Shift) => {
    switch (shift.shift_type) {
      case 'specific_hours':
        return shift.start_time && shift.end_time ? `${shift.start_time}-${shift.end_time}` : 'Orario specifico';
      case 'full_day':
        return 'Giornata intera';
      case 'half_day':
        return `Mezza giornata (${shift.half_day_type === 'morning' ? 'mattina' : 'pomeriggio'})`;
      case 'sick_leave':
        return 'Malattia';
      case 'unavailable':
        return 'Non disponibile';
      default:
        return shift.shift_type;
    }
  };

  const getShiftTypeBadgeVariant = (shiftType: string) => {
    switch (shiftType) {
      case 'specific_hours':
        return 'default';
      case 'full_day':
        return 'secondary';
      case 'half_day':
        return 'outline';
      case 'sick_leave':
        return 'destructive';
      case 'unavailable':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="mobile-day-view space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isTodayDate = isToday(currentDate);

  return (
    <div className="mobile-day-view">
      <Card className={isTodayDate ? 'border-primary shadow-md' : ''}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              <span className={isTodayDate ? 'text-primary' : ''}>
                {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
              </span>
              {isTodayDate && (
                <Badge variant="secondary" className="text-xs">
                  Oggi
                </Badge>
              )}
            </div>
            
            {dayShifts.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {dayShifts.length} turni
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {dayShifts.length > 0 ? (
            <div className="space-y-3">
              {dayShifts
                .sort((a, b) => {
                  // Sort by start time if available, otherwise by creation time
                  if (a.start_time && b.start_time) {
                    return a.start_time.localeCompare(b.start_time);
                  }
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                })
                .map((shift) => {
                const user = getUserInfo(shift.user_id);
                
                return (
                  <TouchOptimizer key={shift.id} minSize="lg">
                    <Card
                      className="shift-card cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onEditShift(shift)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="user-info">
                            <div className="flex items-center gap-3">
                              <div 
                                className="user-avatar"
                                style={{ backgroundColor: user?.color || '#6b7280' }}
                              >
                                {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="user-name font-medium">
                                  {user?.first_name} {user?.last_name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {getShiftTypeLabel(shift)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Badge 
                            variant={getShiftTypeBadgeVariant(shift.shift_type)}
                            className="text-xs"
                          >
                            {shift.shift_type === 'specific_hours' ? 'Orario' : 
                             shift.shift_type === 'full_day' ? 'Giornata' :
                             shift.shift_type === 'half_day' ? 'Mezza' :
                             shift.shift_type === 'sick_leave' ? 'Malattia' : 'N/A'}
                          </Badge>
                        </div>

                        {shift.notes && (
                          <div className="notes-section">
                            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                              {shift.notes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TouchOptimizer>
                );
              })}
            </div>
          ) : (
            <div className="empty-day-content">
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Nessun turno programmato per {isTodayDate ? 'oggi' : 'questo giorno'}
                </p>
                <TouchOptimizer minSize="lg">
                  <Button
                    variant="outline"
                    onClick={() => onCreateShift(currentDate)}
                    className="w-full max-w-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi turno
                  </Button>
                </TouchOptimizer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}