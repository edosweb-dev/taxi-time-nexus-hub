import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from 'date-fns';
import { it } from 'date-fns/locale';
import { Clock, User, MapPin, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Shift } from '@/components/shifts/types';
import { useUsers } from '@/hooks/useUsers';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileListaViewProps {
  currentDate: Date;
  shifts: Shift[];
  isLoading: boolean;
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function MobileListaView({ 
  currentDate, 
  shifts, 
  isLoading, 
  onCreateShift, 
  onEditShift 
}: MobileListaViewProps) {
  const { users } = useUsers();

  const giorni = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getTurniPerGiorno = (giorno: Date) => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.shift_date);
      return isSameDay(shiftDate, giorno);
    });
  };

  const getUserInfo = (userId: string) => {
    return users?.find(user => user.id === userId);
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'programmato': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_corso': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completato': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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

  if (isLoading) {
    return (
      <div className="mobile-lista-view space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mobile-lista-view">
      {giorni.map((giorno) => {
        const turniGiorno = getTurniPerGiorno(giorno);
        const isTodayDate = isToday(giorno);
        const isFutureDate = isFuture(giorno);
        
        // Show days with shifts or today's date
        if (turniGiorno.length === 0 && !isTodayDate) return null;

        return (
          <div key={giorno.toISOString()} className="giorno-section">
            <Card className={isTodayDate ? 'border-primary shadow-md' : ''}>
              <CardContent className="p-4">
                <div className="giorno-header">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className={`giorno-title ${isTodayDate ? 'text-primary font-semibold' : ''}`}>
                      {format(giorno, 'EEEE d MMMM', { locale: it })}
                    </h3>
                    {isTodayDate && (
                      <Badge variant="secondary" className="text-xs">
                        Oggi
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {turniGiorno.length > 0 && (
                      <span className="turni-count">
                        {turniGiorno.length} turni
                      </span>
                    )}
                    
                    {/* Add button for future dates */}
                    {isFutureDate && (
                      <TouchOptimizer minSize="sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCreateShift(giorno)}
                          className="p-1 h-8 w-8"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </TouchOptimizer>
                    )}
                  </div>
                </div>

                {turniGiorno.length > 0 ? (
                  <div className="turni-list">
                    {turniGiorno.map((turno) => {
                      const user = getUserInfo(turno.user_id);
                      
                      return (
                        <TouchOptimizer key={turno.id} minSize="lg">
                          <div
                            className="turno-card"
                            onClick={() => onEditShift(turno)}
                          >
                            <div className="turno-header">
                              <div className="user-info">
                                <div 
                                  className="user-avatar"
                                  style={{ backgroundColor: user?.color || '#6b7280' }}
                                >
                                  {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                                </div>
                                <span className="user-name">
                                  {user?.first_name} {user?.last_name}
                                </span>
                              </div>
                              
                              <Badge className={getStatoColor('programmato')} variant="secondary">
                                {getShiftTypeLabel(turno)}
                              </Badge>
                            </div>

                            <div className="turno-details">
                              <div className="detail-item">
                                <Clock className="detail-icon" />
                                <span>{getShiftTypeLabel(turno)}</span>
                              </div>
                              
                              {turno.notes && (
                                <div className="detail-item">
                                  <MapPin className="detail-icon" />
                                  <span className="truncate">{turno.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TouchOptimizer>
                      );
                    })}
                  </div>
                ) : isTodayDate && (
                  <div className="empty-day">
                    <p className="text-muted-foreground text-sm text-center py-4">
                      Nessun turno programmato per oggi
                    </p>
                    <TouchOptimizer minSize="lg">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCreateShift(giorno)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Aggiungi turno
                      </Button>
                    </TouchOptimizer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}