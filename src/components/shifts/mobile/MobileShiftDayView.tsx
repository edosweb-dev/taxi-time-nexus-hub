import { useState } from 'react';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarIcon, Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Shift } from '@/lib/utils/turniHelpers';
import { getTurnoBadge, getShiftDuration, getTurnoTime } from '@/lib/utils/turniHelpers';
import { useUsers } from '@/hooks/useUsers';

interface MobileShiftDayViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  shifts: Shift[];
  isLoading: boolean;
  onEditShift: (shift: Shift) => void;
  onAddShift?: () => void;
  showAddButton?: boolean;
  showUserInfo?: boolean;
  filterUserId?: string;
}

export function MobileShiftDayView({
  currentDate,
  onDateChange,
  shifts,
  isLoading,
  onEditShift,
  onAddShift,
  showAddButton = true,
  showUserInfo = false,
  filterUserId
}: MobileShiftDayViewProps) {
  const [startX, setStartX] = useState(0);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { users } = useUsers();

  // Filter shifts for current day and user (if filterUserId provided)
  const dayShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.shift_date);
    const matchesDate = isSameDay(shiftDate, currentDate);
    const matchesUser = !filterUserId || shift.user_id === filterUserId;
    return matchesDate && matchesUser;
  });

  const getUserInfo = (userId: string) => {
    return users?.find(user => user.id === userId);
  };

  const handlePrevDay = () => {
    onDateChange(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    onDateChange(addDays(currentDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNextDay();
      } else {
        handlePrevDay();
      }
    }
  };

  return (
    <div className="mobile-calendario w-full">
      {/* Header Mobile - Compatto */}
      <div className="w-full mobile-calendario-header-compact px-4">
        <div className="header-controls-compact">
          <TouchOptimizer minSize="lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevDay}
              className="nav-button-compact"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </TouchOptimizer>

          <div className="date-display-compact">
            <h2 className="current-date-compact">
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h2>
          </div>
          
          <TouchOptimizer minSize="lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              className="nav-button-compact"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </TouchOptimizer>
        </div>

        {/* Action buttons - Compatto */}
        <div className="flex gap-2">
          <TouchOptimizer minSize="md">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="today-button-compact"
            >
              Oggi
            </Button>
          </TouchOptimizer>

          {/* Date Picker */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("h-9 w-9 p-0 flex items-center justify-center")}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="center">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    onDateChange(date);
                    setDatePickerOpen(false);
                  }
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                locale={it}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Content con swipe */}
      <div
        className="mobile-calendario-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : dayShifts.length > 0 ? (
          <div className="space-y-3 px-4 py-4">
            {dayShifts
              .sort((a, b) => {
                if (a.start_time && b.start_time) {
                  return a.start_time.localeCompare(b.start_time);
                }
                return 0;
              })
              .map((shift, index) => {
                const badge = getTurnoBadge(shift);
                const duration = getShiftDuration(shift);
                const time = getTurnoTime(shift);
                const user = getUserInfo(shift.user_id);

                return (
                  <Card 
                    key={shift.id}
                    className="w-full max-w-none cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                    onClick={() => onEditShift(shift)}
                  >
                    <CardContent className="p-4 w-full">
                      <div className="flex items-center gap-3 w-full">
                        {/* Badge Colorato Iniziali */}
                        {showUserInfo && user && (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-md flex-shrink-0"
                            style={{ backgroundColor: user.color || '#6b7280' }}
                          >
                            {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        
                        {/* Info Turno - Occupa Spazio Rimanente */}
                        <div className="flex-1 min-w-0">
                          {showUserInfo && user && (
                            <p className="font-semibold truncate text-base">
                              {user.first_name} {user.last_name}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time ? (
                              <>
                                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{badge.label}</span>
                              </>
                            )}
                          </div>

                          {shift.notes && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {shift.notes}
                            </p>
                          )}
                        </div>
                        
                        {/* Badge Tipo Turno + Durata */}
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Badge 
                            variant="secondary"
                            className="text-xs px-2 py-0.5"
                          >
                            {shift.shift_type === 'full_day' && 'TURNO'}
                            {shift.shift_type === 'half_day' && 'MEZZA'}
                            {shift.shift_type === 'specific_hours' && 'ORE'}
                            {shift.shift_type === 'sick_leave' && 'MALATTIA'}
                            {shift.shift_type === 'unavailable' && 'NON DISP'}
                            {shift.shift_type === 'extra' && 'EXTRA'}
                          </Badge>
                          {duration > 0 && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {duration}h
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Nessun turno per questo giorno
            </p>
            {showAddButton && onAddShift && (
              <Button onClick={onAddShift} className="gap-2">
                <Plus className="h-4 w-4" />
                Aggiungi Turno
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {showAddButton && onAddShift && dayShifts.length > 0 && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            size="lg"
            onClick={onAddShift}
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
