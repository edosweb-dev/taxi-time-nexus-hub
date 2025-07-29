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
      {/* Compact Info & Legend */}
      <div className="flex items-center justify-between gap-4">
        <ShiftGridLegend />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{gridData.length} dipendenti</span>
          <span>•</span>
          <span>Click per modificare turni</span>
        </div>
      </div>

      {/* Compact Weekly Grid */}
      <div className="border rounded-lg overflow-hidden bg-background">
        {/* Sticky Grid Header */}
        <div className="sticky top-0 z-10">
          <ShiftGridHeader monthDays={monthDays} />
        </div>
        
        {/* Compact Grid Body */}
        <div className="max-h-[75vh] overflow-y-auto scrollbar-thin">
          {gridData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nessun dipendente trovato</p>
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