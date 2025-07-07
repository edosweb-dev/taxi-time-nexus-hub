
import { Card, CardContent } from '@/components/ui/card';
import { ShiftCalendarMonthView } from '../ShiftCalendarMonthView';
import { ShiftCalendarGrid } from '../ShiftCalendarGrid';
import { Shift } from '../../types';
import { useAuth } from '@/hooks/useAuth';

interface CalendarContentProps {
  viewMode: "week" | "day" | "month";
  daysInView: Date[];
  hours: number[];
  shiftsInView: Shift[];
  currentMonth: Date;
  shifts: Shift[];
  isAdminOrSocio: boolean;
  handleCellClick: (day: Date, userId: string | null) => void;
  setSelectedShift: (shift: Shift) => void;
  getShiftPosition: (shift: Shift) => { top: number; height: number; spanRows: boolean };
}

export function CalendarContent({
  viewMode,
  daysInView,
  hours,
  shiftsInView,
  currentMonth,
  shifts,
  isAdminOrSocio,
  handleCellClick,
  setSelectedShift,
  getShiftPosition
}: CalendarContentProps) {
  const { user } = useAuth();
  
  // Always show the calendar, regardless of shifts

  // Show calendar based on view mode
  if (viewMode === "month") {
    return (
      <ShiftCalendarMonthView 
        daysInView={daysInView}
        currentMonth={currentMonth}
        shifts={shifts}
        isAdminOrSocio={isAdminOrSocio}
        onCellClick={handleCellClick}
        onSelectShift={setSelectedShift}
        userId={user?.id}
      />
    );
  }
  
  return (
    <ShiftCalendarGrid
      viewMode={viewMode}
      daysInView={daysInView}
      hours={hours}
      shiftsInView={shiftsInView}
      getShiftPosition={getShiftPosition}
      onSelectShift={setSelectedShift}
      onAddShift={(day) => handleCellClick(day, user?.id || null)}
    />
  );
}
