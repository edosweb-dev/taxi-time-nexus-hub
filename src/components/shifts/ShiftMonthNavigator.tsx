
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

interface ShiftMonthNavigatorProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function ShiftMonthNavigator({ currentMonth, onMonthChange }: ShiftMonthNavigatorProps) {
  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">
        {format(currentMonth, 'MMMM yyyy', { locale: it })}
      </h2>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onMonthChange(new Date())}
        >
          Oggi
        </Button>
        <Button variant="outline" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
