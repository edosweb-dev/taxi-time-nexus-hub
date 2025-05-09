
import { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useShifts, Shift } from './ShiftContext';
import { useAuth } from '@/contexts/AuthContext';
import { AddShiftDialog } from './AddShiftDialog';
import { ShiftMonthNavigator } from './ShiftMonthNavigator';
import { ShiftListRow } from './ShiftListRow';
import { ShiftEmptyState } from './ShiftEmptyState';

interface ShiftListProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
}

export function ShiftList({ currentMonth, onMonthChange, isAdminOrSocio }: ShiftListProps) {
  const { shifts, isLoading, setSelectedShift } = useShifts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Handler for selecting a shift
  const handleSelectShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Caricamento turni...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <ShiftMonthNavigator 
        currentMonth={currentMonth} 
        onMonthChange={onMonthChange} 
      />

      {shifts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              {isAdminOrSocio && <TableHead>Utente</TableHead>}
              <TableHead>Tipo</TableHead>
              <TableHead>Orario</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-[100px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts
              .sort((a, b) => a.shift_date.localeCompare(b.shift_date))
              .map((shift) => (
                <ShiftListRow 
                  key={shift.id}
                  shift={shift}
                  isAdminOrSocio={isAdminOrSocio}
                  onSelectShift={handleSelectShift}
                />
              ))}
          </TableBody>
        </Table>
      ) : (
        <ShiftEmptyState onAddShift={() => setIsAddDialogOpen(true)} />
      )}

      <AddShiftDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
      />
    </div>
  );
}
