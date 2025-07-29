import { Loader2 } from 'lucide-react';
import { useShiftGrid } from './hooks/useShiftGrid';
import { WeekRow } from './WeekRow';
import { ShiftGridLegend } from './ShiftGridLegend';
import { QuickShiftToolbar } from './QuickShiftToolbar';
import { QuickShiftDialog } from '../dialogs/QuickShiftDialog';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ShiftGridViewProps {
  currentMonth: Date;
  selectedUserIds?: string[];
}

export function ShiftGridView({ currentMonth, selectedUserIds = [] }: ShiftGridViewProps) {
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
            Click su un giorno per gestire i turni
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
                currentMonth={currentMonth}
              />
            ))
          )}
        </div>
      </div>

      {/* Quick Shift Dialog */}
      <QuickShiftDialog
        open={quickDialogOpen}
        onOpenChange={setQuickDialogOpen}
        selectedCell={selectedCell}
        user={null} // Non c'è un utente specifico selezionato
        existingShifts={existingShifts.map(s => ({ ...s, user: undefined }))} // Rimuovi user info per compatibilità
      />
    </div>
  );
}