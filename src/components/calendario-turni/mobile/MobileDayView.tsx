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
      case 'full_day':
        return 'Giornata intera';
      case 'half_day':
        return `Mezza giornata (${shift.half_day_type === 'morning' ? 'mattina' : 'pomeriggio'})`;
      case 'extra':
        return 'Extra';
      case 'unavailable':
        return 'Non disponibile';
      default:
        return shift.shift_type;
    }
  };

  const getShiftTypeBadgeVariant = (shiftType: string) => {
    switch (shiftType) {
      case 'full_day':
        return 'secondary';
      case 'half_day':
        return 'outline';
      case 'extra':
        return 'default';
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
    <div className="mobile-day-view-compact">
      {/* Header compatto */}
      <div className={`day-header-compact ${isTodayDate ? 'today-header' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`header-icon ${isTodayDate ? 'today-icon' : ''}`}>
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="header-title">
                {format(currentDate, 'EEEE d MMMM', { locale: it })}
              </h3>
              {isTodayDate && (
                <span className="today-badge">Oggi</span>
              )}
            </div>
          </div>
          
          {dayShifts.length > 0 && (
            <div className="shift-counter">
              {dayShifts.length} turni
            </div>
          )}
        </div>
      </div>

      {/* Lista turni compatta */}
      {dayShifts.length > 0 ? (
        <div className="shifts-list-compact">
          {dayShifts
            .sort((a, b) => {
              if (a.start_time && b.start_time) {
                return a.start_time.localeCompare(b.start_time);
              }
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            })
            .map((shift, index) => {
              const user = getUserInfo(shift.user_id);
              
              return (
                <TouchOptimizer key={shift.id} minSize="lg">
                  <div
                    className="shift-card-compact animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => onEditShift(shift)}
                  >
                    <div className="shift-main-info">
                      <div className="shift-user">
                        <div 
                          className="user-avatar-compact"
                          style={{ backgroundColor: user?.color || '#6b7280' }}
                        >
                          {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                        </div>
                        <div className="user-details">
                          <span className="user-name-compact">
                            {user?.first_name} {user?.last_name}
                          </span>
                          <div className="shift-time">
                            <Clock className="w-3 h-3" />
                            <span>{getShiftTypeLabel(shift)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="shift-badge-compact">
                        <span className={`badge-${shift.shift_type}`}>
                          {shift.shift_type === 'full_day' ? 'Giornata' :
                           shift.shift_type === 'half_day' ? 'Mezza' :
                           shift.shift_type === 'extra' ? 'Extra' : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {shift.notes && (
                      <div className="shift-notes-compact">
                        <p>{shift.notes}</p>
                      </div>
                    )}
                  </div>
                </TouchOptimizer>
              );
            })}
        </div>
      ) : (
        <div className="empty-state-compact">
          <div className="empty-icon">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className="empty-text">
            <h4>Nessun turno per {isTodayDate ? 'oggi' : 'questo giorno'}</h4>
            <p>Aggiungi un nuovo turno con il pulsante +</p>
          </div>
        </div>
      )}
    </div>
  );
}