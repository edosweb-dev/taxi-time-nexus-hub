import React from 'react';
import { Loader2 } from 'lucide-react';
import { Shift } from '@/components/shifts/types';
import { Profile } from '@/lib/types';
import { MonthView } from './views/MonthView';
import { WeekView } from './views/WeekView';
import { DayView } from './views/DayView';

interface CalendarioViewProps {
  viewMode: 'month' | 'week' | 'day';
  currentDate: Date;
  shifts: Shift[];
  employees: Profile[];
  isLoading: boolean;
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function CalendarioView({
  viewMode,
  currentDate,
  shifts,
  employees,
  isLoading,
  onCreateShift,
  onEditShift
}: CalendarioViewProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Caricamento turni...</span>
        </div>
      </div>
    );
  }

  const commonProps = {
    currentDate,
    shifts,
    employees,
    onCreateShift,
    onEditShift
  };

  switch (viewMode) {
    case 'month':
      return <MonthView {...commonProps} />;
    case 'week':
      return <WeekView {...commonProps} />;
    case 'day':
      return <DayView {...commonProps} />;
    default:
      return <MonthView {...commonProps} />;
  }
}