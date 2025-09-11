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
      <Card className={`${isTodayDate ? 'border-primary/50 shadow-lg bg-gradient-to-br from-primary/5 to-background' : 'shadow-md'} rounded-2xl overflow-hidden`}>
        <CardHeader className="pb-4 bg-gradient-to-r from-background/95 to-muted/20">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isTodayDate ? 'bg-primary/20' : 'bg-muted/50'}`}>
                <CalendarIcon className={`w-5 h-5 ${isTodayDate ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className={`font-bold text-lg ${isTodayDate ? 'text-primary' : 'text-foreground'}`}>
                  {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
                </div>
                {isTodayDate && (
                  <Badge variant="secondary" className="text-xs mt-1 bg-primary/20 text-primary">
                    Oggi
                  </Badge>
                )}
              </div>
            </div>
            
            {dayShifts.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-gradient-to-r from-muted/50 to-muted/30 border-border/50">
                  {dayShifts.length} turni
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6">{dayShifts.length > 0 ? (
            <div className="space-y-4">{dayShifts
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
                      className="shift-card cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 
                               bg-gradient-to-r from-card to-card/90 border-border/50 rounded-xl overflow-hidden"
                      onClick={() => onEditShift(shift)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="user-info">
                            <div className="flex items-center gap-4">
                              <div 
                                className="user-avatar shadow-lg"
                                style={{ backgroundColor: user?.color || '#6b7280' }}
                              >
                                {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="user-name font-semibold text-base">
                                  {user?.first_name} {user?.last_name}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-2 py-1">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground font-medium">
                                      {getShiftTypeLabel(shift)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Badge 
                            variant={getShiftTypeBadgeVariant(shift.shift_type)}
                            className="text-xs font-medium px-3 py-1 rounded-lg"
                          >
                            {shift.shift_type === 'specific_hours' ? 'Orario' : 
                             shift.shift_type === 'full_day' ? 'Giornata' :
                             shift.shift_type === 'half_day' ? 'Mezza' :
                             shift.shift_type === 'sick_leave' ? 'Malattia' : 'N/A'}
                          </Badge>
                        </div>

                        {shift.notes && (
                          <div className="notes-section">
                            <p className="text-sm text-muted-foreground bg-gradient-to-r from-muted/40 to-muted/20 p-3 rounded-lg border border-border/30">
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
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl flex items-center justify-center mb-6">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground opacity-60" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Nessun turno programmato
                </h3>
                <p className="text-muted-foreground mb-6 text-sm">
                  {isTodayDate ? 'Non ci sono turni per oggi' : 'Non ci sono turni per questo giorno'}
                </p>
                <TouchOptimizer minSize="lg">
                  <Button
                    onClick={() => onCreateShift(currentDate)}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg rounded-xl px-6"
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