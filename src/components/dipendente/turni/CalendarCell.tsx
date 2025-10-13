import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarDay } from '@/lib/utils/turniHelpers';
import { getTurnoBadge, getTurnoTime } from '@/lib/utils/turniHelpers';

interface CalendarCellProps {
  day: CalendarDay;
  onClick: () => void;
}

export function CalendarCell({ day, onClick }: CalendarCellProps) {
  const badge = getTurnoBadge(day.turno);
  const timeDisplay = getTurnoTime(day.turno);
  const isWeekend = day.dayOfWeek === 0 || day.dayOfWeek === 6;

  return (
    <div
      onClick={onClick}
      className={cn(
        "min-h-[80px] md:min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md",
        "flex flex-col items-center justify-start gap-1",
        day.isToday && "ring-2 ring-primary bg-primary/5",
        day.isPast && "opacity-60",
        isWeekend && "bg-muted/30",
        !day.turno && "hover:bg-accent/50"
      )}
      style={{ minWidth: '48px' }}
    >
      {/* Day number */}
      <div
        className={cn(
          "text-sm font-semibold w-6 h-6 rounded-full flex items-center justify-center",
          day.isToday && "bg-primary text-primary-foreground"
        )}
      >
        {day.dayNumber}
      </div>

      {/* Turno badge */}
      <Badge
        variant="outline"
        className={cn(
          "text-xs px-2 py-0.5 font-medium",
          badge.className,
          !day.turno && "border-dashed"
        )}
      >
        {badge.emoji || badge.label}
      </Badge>

      {/* Time display */}
      {timeDisplay && (
        <span className="text-xs text-muted-foreground text-center">
          {timeDisplay}
        </span>
      )}
    </div>
  );
}
