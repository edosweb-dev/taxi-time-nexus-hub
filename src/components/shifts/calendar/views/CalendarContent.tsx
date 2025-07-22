
import { Card, CardContent } from '@/components/ui/card';
import { ShiftCalendarMonthView } from '../ShiftCalendarMonthView';
import { ShiftCalendarGrid } from '../ShiftCalendarGrid';
import { ShiftDetailsDialog } from '../../dialogs/ShiftDetailsDialog';
import { EditShiftDialog } from '../../dialogs/EditShiftDialog';
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
  isDetailsDialogOpen: boolean;
  setIsDetailsDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedDate: Date | null;
  selectedDateShifts: Shift[];
  selectedShift: Shift | null;
  handleEditShift: (shift: Shift) => void;
  handleDeleteShift: (shiftId: string) => Promise<void>;
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
  getShiftPosition,
  isDetailsDialogOpen,
  setIsDetailsDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedDate,
  selectedDateShifts,
  selectedShift,
  handleEditShift,
  handleDeleteShift
}: CalendarContentProps) {
  const { user } = useAuth();
  
  // Show calendar based on view mode
  if (viewMode === "month") {
    return (
      <>
        <ShiftCalendarMonthView 
          daysInView={daysInView}
          currentMonth={currentMonth}
          shifts={shifts}
          isAdminOrSocio={isAdminOrSocio}
          onCellClick={handleCellClick}
          onSelectShift={setSelectedShift}
          userId={user?.id}
        />
        
        <ShiftDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          shifts={selectedDateShifts}
          selectedDate={selectedDate || new Date()}
          onEditShift={handleEditShift}
          onDeleteShift={handleDeleteShift}
          canEdit={isAdminOrSocio || selectedDateShifts.some(s => s.user_id === user?.id)}
        />
        
        <EditShiftDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          shift={selectedShift}
          isAdminOrSocio={isAdminOrSocio}
        />
      </>
    );
  }
  
  return (
    <>
      <ShiftCalendarGrid
        viewMode={viewMode}
        daysInView={daysInView}
        hours={hours}
        shiftsInView={shiftsInView}
        getShiftPosition={getShiftPosition}
        onSelectShift={setSelectedShift}
        onAddShift={(day) => handleCellClick(day, user?.id || null)}
      />
      
      <ShiftDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        shifts={selectedDateShifts}
        selectedDate={selectedDate || new Date()}
        onEditShift={handleEditShift}
        onDeleteShift={handleDeleteShift}
        canEdit={isAdminOrSocio || selectedDateShifts.some(s => s.user_id === user?.id)}
      />
      
      <EditShiftDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        shift={selectedShift}
        isAdminOrSocio={isAdminOrSocio}
      />
    </>
  );
}
