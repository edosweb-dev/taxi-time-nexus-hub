import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useTurniMese } from '@/hooks/dipendente/useTurniMese';
import { Shift } from '@/lib/utils/turniHelpers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTurnoBadge, getShiftDuration } from '@/lib/utils/turniHelpers';
import { Skeleton } from '@/components/ui/skeleton';

interface MobileTurniViewProps {
  onNewTurno: () => void;
  onTurnoClick: (turno: Shift) => void;
}

export function MobileTurniView({ onNewTurno, onTurnoClick }: MobileTurniViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startX, setStartX] = useState(0);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();

  const { data: turni = [], isLoading } = useTurniMese(year, month);

  // Filter shifts for current day
  const todayShifts = turni.filter(turno => {
    const turnoDate = new Date(turno.shift_date);
    return turnoDate.getDate() === day &&
           turnoDate.getMonth() === currentDate.getMonth() &&
           turnoDate.getFullYear() === currentDate.getFullYear();
  });

  const handlePrevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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

          {/* Date Picker - Solo Mobile */}
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
                    setCurrentDate(date);
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
        ) : todayShifts.length > 0 ? (
          <div className="space-y-3 p-4">
            {todayShifts.map(turno => {
              const badge = getTurnoBadge(turno);
              const duration = getShiftDuration(turno);

              return (
                <Card 
                  key={turno.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onTurnoClick(turno)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={badge.className}>
                        {badge.emoji} {badge.label}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground">
                        {duration}
                      </span>
                    </div>

                    {turno.shift_type === 'specific_hours' && turno.start_time && turno.end_time && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Orario: {turno.start_time.slice(0, 5)} - {turno.end_time.slice(0, 5)}
                      </div>
                    )}

                    {turno.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {turno.notes}
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
            <Button onClick={onNewTurno} className="gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi Turno
            </Button>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {todayShifts.length > 0 && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            size="lg"
            onClick={onNewTurno}
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
