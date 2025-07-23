
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
  selectedUserIds?: string[];
}

export function ShiftCalendarView({ 
  currentMonth, 
  onMonthChange, 
  isAdminOrSocio,
  selectedUserIds
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
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedDate,
    selectedShiftUserId,
    selectedShift,
    selectedDateShifts,
    handleCellClick,
    handleEditShift,
    handleDeleteShift,
    formatViewPeriod,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
    getShiftPosition,
    setSelectedShift
  } = useCalendarView(currentMonth, onMonthChange, selectedUserIds);

  return (
    <div className="space-y-6">
      <div className="bg-background border rounded-lg">
        <div className="p-4 border-b">
          <ShiftCalendarHeader 
            currentDate={currentMonth}
            viewMode={viewMode}
            setViewMode={setViewMode}
            goToPreviousPeriod={goToPreviousPeriod}
            goToNextPeriod={goToNextPeriod}
            goToToday={goToToday}
            formatViewPeriod={formatViewPeriod}
          />
        </div>
        
        <div className="p-4">
          <ShiftCalendarLegend />
        </div>
        
        <div className="p-4 pt-0">
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
            isDetailsDialogOpen={isDetailsDialogOpen}
            setIsDetailsDialogOpen={setIsDetailsDialogOpen}
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
            selectedDate={selectedDate}
            selectedDateShifts={selectedDateShifts}
            selectedShift={selectedShift}
            handleEditShift={handleEditShift}
            handleDeleteShift={handleDeleteShift}
          />
        </div>
      </div>
      
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
