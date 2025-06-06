
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ShiftCalendarHeader } from './ShiftCalendarHeader';
import { ShiftCalendarLegend } from './ShiftCalendarLegend';
import { AddShiftDialog } from '../AddShiftDialog';
import { useCalendarView } from './hooks/useCalendarView';
import { CalendarContent } from './views/CalendarContent';
import { useShifts } from '../ShiftContext';

interface ShiftCalendarViewProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
  selectedUserId?: string | null;
}

export function ShiftCalendarView({ 
  currentMonth, 
  onMonthChange, 
  isAdminOrSocio,
  selectedUserId
}: ShiftCalendarViewProps) {
  const { shifts } = useShifts();
  
  const {
    viewMode,
    setViewMode,
    daysInView,
    hours,
    shiftsInView,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedDate,
    selectedShiftUserId,
    handleCellClick,
    formatViewPeriod,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
    getShiftPosition,
    setSelectedShift
  } = useCalendarView(currentMonth, onMonthChange, selectedUserId);

  return (
    <div className="space-y-4">
      <ShiftCalendarHeader 
        currentDate={currentMonth}
        viewMode={viewMode}
        setViewMode={setViewMode}
        goToPreviousPeriod={goToPreviousPeriod}
        goToNextPeriod={goToNextPeriod}
        goToToday={goToToday}
        formatViewPeriod={formatViewPeriod}
      />
      
      <ShiftCalendarLegend />
      
      <CalendarContent 
        viewMode={viewMode}
        daysInView={daysInView}
        hours={hours}
        shiftsInView={shiftsInView}
        currentMonth={currentMonth}
        shifts={shifts}
        isAdminOrSocio={isAdminOrSocio}
        handleCellClick={handleCellClick}
        setSelectedShift={setSelectedShift}
        getShiftPosition={getShiftPosition}
      />
      
      <AddShiftDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
        defaultDate={selectedDate}
        defaultUserId={selectedShiftUserId}
      />
    </div>
  );
}
