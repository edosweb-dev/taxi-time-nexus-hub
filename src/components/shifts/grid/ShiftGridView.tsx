import { Loader2 } from 'lucide-react';
import { useShiftGrid } from './hooks/useShiftGrid';
import { ShiftGridHeader } from './ShiftGridHeader';
import { ShiftGridRow } from './ShiftGridRow';
import { ShiftGridLegend } from './ShiftGridLegend';
import { QuickShiftDialog } from '../dialogs/QuickShiftDialog';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ShiftGridViewProps {
  currentMonth: Date;
  selectedUserIds?: string[];
}

export function ShiftGridView({ currentMonth, selectedUserIds = [] }: ShiftGridViewProps) {
  const {
    gridData,
    monthDays,
    selectedCell,
    quickDialogOpen,
    setQuickDialogOpen,
    isLoading,
    handleCellClick,
    getShiftsForCell
  } = useShiftGrid(currentMonth, selectedUserIds);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Caricamento griglia turni...</span>
      </div>
    );
  }

  const selectedUser = selectedCell 
    ? gridData.find(data => data.user.id === selectedCell.userId)?.user || null 
    : null;

  const existingShifts = selectedCell 
    ? getShiftsForCell(selectedCell.userId, new Date(selectedCell.date))
    : [];

  return (
    <div className="space-y-4">
      {/* Month Header */}
      <div className="text-center py-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
        <h2 className="text-2xl font-bold text-primary">
          {format(currentMonth, 'MMMM yyyy', { locale: it }).toUpperCase()}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Clicca su una cella per gestire i turni
        </p>
      </div>

      {/* Legend */}
      <ShiftGridLegend />

      {/* Grid */}
      <div className="border rounded-lg overflow-hidden bg-background">
        {/* Grid Header */}
        <ShiftGridHeader monthDays={monthDays} />
        
        {/* Grid Body */}
        <div className="max-h-[600px] overflow-y-auto">
          {gridData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nessun dipendente trovato per questo filtro</p>
            </div>
          ) : (
            gridData.map((data) => (
              <ShiftGridRow
                key={data.user.id}
                user={data.user}
                monthDays={monthDays}
                getShiftsForCell={getShiftsForCell}
                onCellClick={handleCellClick}
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
        user={selectedUser}
        existingShifts={existingShifts}
      />
    </div>
  );
}