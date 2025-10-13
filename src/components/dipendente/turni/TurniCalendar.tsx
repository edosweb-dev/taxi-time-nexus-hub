import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCell } from './CalendarCell';
import { generateCalendarDays, CalendarDay, getCalendarPaddingDays } from '@/lib/utils/turniHelpers';
import { Shift } from '@/lib/utils/turniHelpers';

interface TurniCalendarProps {
  year: number;
  month: number;
  turni: Shift[];
  isLoading: boolean;
  onDayClick: (day: CalendarDay) => void;
}

const WEEK_DAYS = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

export function TurniCalendar({
  year,
  month,
  turni,
  isLoading,
  onDayClick,
}: TurniCalendarProps) {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-[80px] md:h-[100px]" />
          ))}
        </div>
      </Card>
    );
  }

  const calendarDays = generateCalendarDays(year, month, turni);
  const paddingDays = getCalendarPaddingDays(year, month);

  return (
    <Card className="p-4">
      {/* Week headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Padding days */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`padding-${i}`} className="min-h-[80px] md:min-h-[100px]" />
        ))}

        {/* Calendar days */}
        {calendarDays.map((day) => (
          <CalendarCell
            key={day.date.toISOString()}
            day={day}
            onClick={() => onDayClick(day)}
          />
        ))}
      </div>

      {/* Empty state */}
      {turni.length === 0 && (
        <div className="mt-8 text-center py-8">
          <p className="text-muted-foreground">Nessun turno programmato questo mese</p>
        </div>
      )}
    </Card>
  );
}
