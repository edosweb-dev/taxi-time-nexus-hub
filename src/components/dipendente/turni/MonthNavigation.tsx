import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface MonthNavigationProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function MonthNavigation({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: MonthNavigationProps) {
  const monthYear = format(currentDate, 'MMMM yyyy', { locale: it });

  return (
    <div className="flex items-center justify-between mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onPreviousMonth}
        aria-label="Mese precedente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold capitalize">{monthYear}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
          className="text-xs"
        >
          <CalendarDays className="h-3 w-3 mr-1" />
          Oggi
        </Button>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onNextMonth}
        aria-label="Mese successivo"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
