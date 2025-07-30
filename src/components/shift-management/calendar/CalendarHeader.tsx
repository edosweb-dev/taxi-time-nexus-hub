import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: 'month' | 'week' | 'day';
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  viewMode,
  onViewModeChange
}: CalendarHeaderProps) {
  const handlePrevious = () => {
    let newDate: Date;
    switch (viewMode) {
      case 'month':
        newDate = subMonths(currentDate, 1);
        break;
      case 'week':
        newDate = subWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = subDays(currentDate, 1);
        break;
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    switch (viewMode) {
      case 'month':
        newDate = addMonths(currentDate, 1);
        break;
      case 'week':
        newDate = addWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = addDays(currentDate, 1);
        break;
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateDisplay = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: it });
      case 'week':
        return `Settimana del ${format(currentDate, 'd MMMM yyyy', { locale: it })}`;
      case 'day':
        return format(currentDate, 'EEEE d MMMM yyyy', { locale: it });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-card">
      {/* Left: Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleToday} className="gap-2">
          <CalendarDays className="h-4 w-4" />
          Oggi
        </Button>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handlePrevious} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNext} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Center: Date Display */}
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-primary" />
      </div>

      {/* Right: View Mode */}
      <div className="flex items-center gap-2">
        <Select value={viewMode} onValueChange={onViewModeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mese</SelectItem>
            <SelectItem value="week">Settimana</SelectItem>
            <SelectItem value="day">Giorno</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}