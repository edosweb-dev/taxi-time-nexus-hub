import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isWeekend,
  startOfWeek,
  addMonths,
  subMonths
} from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExistingShift {
  id: string;
  shift_date: string;
  shift_type: 'full_day' | 'half_day' | 'extra' | 'unavailable';
  half_day_type?: 'morning' | 'afternoon';
}

interface DateGridSelectorProps {
  month: Date;
  selectedDates: string[];
  existingShifts: Map<string, ExistingShift>;
  onDatesChange: (dates: string[]) => void;
  onMonthChange: (date: Date) => void;
}

const SHIFT_TYPE_BADGES = {
  full_day: { label: 'GI', color: 'bg-green-500', title: 'Giornata intera' },
  half_day: { label: '½', color: 'bg-yellow-500', title: 'Mezza giornata' },
  extra: { label: 'EX', color: 'bg-purple-500', title: 'Extra' },
  unavailable: { label: 'ND', color: 'bg-gray-500', title: 'Non disponibile' }
};

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function DateGridSelector({ 
  month, 
  selectedDates, 
  existingShifts, 
  onDatesChange,
  onMonthChange
}: DateGridSelectorProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const handlePrevMonth = () => {
    onMonthChange(subMonths(month, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(month, 1));
  };

  const getShiftBadge = (shift: ExistingShift) => {
    const config = SHIFT_TYPE_BADGES[shift.shift_type];
    let label = config.label;
    
    if (shift.shift_type === 'half_day' && shift.half_day_type) {
      label = shift.half_day_type === 'morning' ? '½M' : '½P';
    }
    
    return { ...config, label };
  };

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

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="font-semibold text-lg capitalize">
          {format(month, 'MMMM yyyy', { locale: it })}
        </h3>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
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
            const existingShift = existingShifts.get(dateStr);
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
                    : existingShift
                    ? "bg-orange-500/5 border-orange-500/50"
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
                
                {/* Shift type badge */}
                {existingShift && (
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "absolute top-0.5 right-0.5 h-4 px-1 text-[8px] font-bold",
                      getShiftBadge(existingShift).color,
                      "text-white border-0"
                    )}
                    title={getShiftBadge(existingShift).title}
                  >
                    {getShiftBadge(existingShift).label}
                  </Badge>
                )}
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute bottom-0.5 right-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 border-t pt-3">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Selezionato</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="h-4 px-1 text-[8px] bg-green-500 text-white border-0">GI</Badge>
            <span>Giornata intera</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="h-4 px-1 text-[8px] bg-yellow-500 text-white border-0">½</Badge>
            <span>Mezza giornata</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="h-4 px-1 text-[8px] bg-purple-500 text-white border-0">EX</Badge>
            <span>Extra</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge className="h-4 px-1 text-[8px] bg-gray-500 text-white border-0">ND</Badge>
            <span>Non disponibile</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          💡 I turni esistenti sono pre-selezionati. Deseleziona per eliminarli, seleziona nuove date per aggiungerli.
        </p>
      </div>
    </div>
  );
}
