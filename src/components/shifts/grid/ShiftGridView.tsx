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
    <div className="space-y-2">
      {/* Info compatta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground px-2">
        <span>{employees.length} dipendenti</span>
        <span>•</span>
        <span>Click su giorno per gestire turni</span>
      </div>

      {/* Weekly Grid */}
      <div className="border rounded-lg overflow-hidden bg-background">
        <div className="max-h-[75vh] overflow-y-auto scrollbar-thin">
          {weekData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nessuna settimana da visualizzare</p>
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