import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isWeekend,
  getDay,
  isSameDay,
  startOfWeek
} from 'date-fns';
import { it } from 'date-fns/locale';

interface DateGridSelectorProps {
  month: Date;
  selectedDates: string[];
  existingShiftDates: Set<string>;
  onDatesChange: (dates: string[]) => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function DateGridSelector({ 
  month, 
  selectedDates, 
  existingShiftDates, 
  onDatesChange 
}: DateGridSelectorProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Generate calendar days
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: monthEnd });
  const paddingDays = days.filter(day => !isSameMonth(day, month));
  const monthDays = days.filter(day => isSameMonth(day, month));

  // Quick actions
  const selectWorkdays = () => {
    const workdays = monthDays
      .filter(day => !isWeekend(day))
      .map(day => format(day, 'yyyy-MM-dd'));
    onDatesChange(workdays);
  };

  const selectAllMonth = () => {
    const allDays = monthDays.map(day => format(day, 'yyyy-MM-dd'));
    onDatesChange(allDays);
  };

  const deselectAll = () => {
    onDatesChange([]);
  };

  const toggleDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      onDatesChange(selectedDates.filter(d => d !== dateStr));
    } else {
      onDatesChange([...selectedDates, dateStr]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          onClick={selectWorkdays}
          className="text-xs"
        >
          Giorni lavorativi
        </Button>
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          onClick={selectAllMonth}
          className="text-xs"
        >
          Tutto il mese
        </Button>
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          onClick={deselectAll}
          className="text-xs"
        >
          Deseleziona tutto
        </Button>
        {selectedDates.length > 0 && (
          <Badge variant="secondary" className="ml-auto">
            {selectedDates.length} {selectedDates.length === 1 ? 'giorno' : 'giorni'}
          </Badge>
        )}
      </div>

      {/* Month title */}
      <div className="text-center">
        <h3 className="font-semibold text-lg capitalize">
          {format(month, 'MMMM yyyy', { locale: it })}
        </h3>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAY_LABELS.map((label) => (
            <div 
              key={label} 
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Padding days from previous month */}
          {paddingDays.map((day, index) => (
            <div key={`padding-${index}`} className="aspect-square" />
          ))}

          {/* Current month days */}
          {monthDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDates.includes(dateStr);
            const hasExistingShift = existingShiftDates.has(dateStr);
            const isWeekendDay = isWeekend(day);
            const isHovered = hoveredDate === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => toggleDate(dateStr)}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                className={cn(
                  "aspect-square relative rounded-lg border-2 transition-all",
                  "flex flex-col items-center justify-center gap-0.5 p-1",
                  "hover:scale-105 active:scale-95",
                  isSelected 
                    ? "bg-primary/10 border-primary shadow-md" 
                    : "bg-background border-border/50 hover:border-border",
                  isWeekendDay && "bg-muted/30",
                  isHovered && "ring-2 ring-primary/30"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-primary font-semibold" : "text-foreground",
                  isWeekendDay && !isSelected && "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </span>
                
                {/* Indicators */}
                <div className="flex items-center gap-1 absolute bottom-1">
                  {hasExistingShift && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" 
                         title="Turno esistente" 
                    />
                  )}
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Selezionato</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Turno esistente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-muted/50 rounded" />
          <span>Weekend</span>
        </div>
      </div>
    </div>
  );
}
