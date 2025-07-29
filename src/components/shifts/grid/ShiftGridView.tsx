import { Loader2 } from 'lucide-react';
import { useShiftGrid } from './hooks/useShiftGrid';
import { WeekRow } from './WeekRow';
import { ShiftGridLegend } from './ShiftGridLegend';
import { QuickShiftToolbar } from './QuickShiftToolbar';
import { QuickShiftDialog } from '../dialogs/QuickShiftDialog';
import { ShiftDetailsDialog } from '../dialogs/ShiftDetailsDialog';
import { EditShiftDialog } from '../dialogs/EditShiftDialog';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState } from 'react';
import { Shift } from '../ShiftContext';
import { useShifts } from '../ShiftContext';

interface ShiftGridViewProps {
  currentMonth: Date;
  selectedUserIds?: string[];
}

export function ShiftGridView({ currentMonth, selectedUserIds = [] }: ShiftGridViewProps) {
  const { deleteShift } = useShifts();
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [shiftDetailsOpen, setShiftDetailsOpen] = useState(false);
  const [editShiftOpen, setEditShiftOpen] = useState(false);
  
  const {
    weekData,
    shiftsByDate,
    selectedCell,
    quickDialogOpen,
    setQuickDialogOpen,
    isLoading,
    handleCellClick,
    getShiftsForDate,
    employees,
    quickInsertMode,
    setQuickShiftType,
    setQuickEmployee,
    setQuickHalfDayType,
    setQuickStartTime,
    setQuickEndTime,
    clearQuickInsert
  } = useShiftGrid(currentMonth, selectedUserIds);

  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setShiftDetailsOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setShiftDetailsOpen(false); // Chiudi il dialog di dettagli
    setEditShiftOpen(true); // Apri il dialog di modifica
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await deleteShift(shiftId);
      setShiftDetailsOpen(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Caricamento griglia turni...</span>
      </div>
    );
  }

  const selectedDate = selectedCell 
    ? new Date(selectedCell.date)
    : null;

  const existingShifts = selectedDate 
    ? getShiftsForDate(selectedDate)
    : [];

  return (
    <div className="space-y-4">
      {/* Info header */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">
            {employees.length} dipendenti attivi
          </span>
          <span className="text-xs text-muted-foreground">
            Click su un turno per visualizzarlo e modificarlo
          </span>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="border rounded-lg overflow-hidden bg-background shadow-sm">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
          {weekData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-base">Nessuna settimana da visualizzare</p>
            </div>
          ) : (
            weekData.map((week, index) => (
              <WeekRow
                key={`week-${index}`}
                week={week}
                getShiftsForDate={getShiftsForDate}
                onCellClick={handleCellClick}
                onShiftClick={handleShiftClick}
                currentMonth={currentMonth}
              />
            ))
          )}
        </div>
      </div>

      {/* Shift Details Dialog */}
      {selectedShift && (
        <ShiftDetailsDialog
          open={shiftDetailsOpen}
          onOpenChange={setShiftDetailsOpen}
          shifts={[selectedShift]}
          selectedDate={new Date(selectedShift.shift_date)}
          onEditShift={handleEditShift}
          onDeleteShift={handleDeleteShift}
          canEdit={true}
        />
      )}

      {/* Edit Shift Dialog */}
      {selectedShift && (
        <EditShiftDialog
          open={editShiftOpen}
          onOpenChange={setEditShiftOpen}
          shift={selectedShift}
          isAdminOrSocio={true}
        />
      )}
    </div>
  );
}