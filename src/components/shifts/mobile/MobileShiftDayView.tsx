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
}

export function MobileShiftDayView({
  currentDate,
  onDateChange,
  shifts,
  isLoading,
  onEditShift,
  onAddShift,
  showAddButton = true,
  showUserInfo = false
}: MobileShiftDayViewProps) {
  const [startX, setStartX] = useState(0);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { users } = useUsers();

  // Filter shifts for current day
  const dayShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.shift_date);
    return isSameDay(shiftDate, currentDate);
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
    <div className="mobile-calendario w-full px-0">
      {/* Header Mobile - Compatto */}
      <div className="w-full mobile-calendario-header-compact px-0">
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
          <div className="space-y-3 p-4">
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
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onEditShift(shift)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {showUserInfo && user && (
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                              style={{ backgroundColor: user.color || '#6b7280' }}
                            >
                              {user.first_name?.[0]?.toUpperCase()}{user.last_name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <Badge className={badge.className}>
                            {badge.emoji} {badge.label}
                          </Badge>
                        </div>
                        {duration > 0 && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {duration}h
                          </span>
                        )}
                      </div>

                      {showUserInfo && user && (
                        <div className="text-sm font-medium mb-2">
                          {user.first_name} {user.last_name}
                        </div>
                      )}

                      {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Clock className="w-3 h-3" />
                          <span>{shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}</span>
                        </div>
                      )}

                      {shift.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {shift.notes}
                        </p>
                      )}
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
