
import { useState, useEffect } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useShifts, Shift } from './ShiftContext';
import { useAuth } from '@/contexts/AuthContext';
import { AddShiftDialog } from './AddShiftDialog';
import { ShiftMonthNavigator } from './ShiftMonthNavigator';
import { ShiftListRow } from './ShiftListRow';
import { ShiftEmptyState } from './ShiftEmptyState';
import { ShiftListFilters } from './ShiftListFilters';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ShiftListProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
  selectedUserIds?: string[];
}

export function ShiftList({ currentMonth, onMonthChange, isAdminOrSocio, selectedUserIds }: ShiftListProps) {
  const { shifts, isLoading, setSelectedShift, deleteShift, setUserFilter, setDateFilter } = useShifts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Apply the user filter if provided
  useEffect(() => {
    // For backward compatibility, use first selected user or null
    const firstUserId = selectedUserIds && selectedUserIds.length > 0 ? selectedUserIds[0] : null;
    setUserFilter(firstUserId);
  }, [selectedUserIds, setUserFilter]);
  
  // Handler for selecting a shift
  const handleSelectShift = (shift: Shift) => {
    setSelectedShift(shift);
    setIsAddDialogOpen(true);
  };
  
  // Handler for confirming deletion
  const handleDeleteConfirm = async () => {
    if (shiftToDelete) {
      await deleteShift(shiftToDelete);
      setShiftToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handler for initiating delete
  const handleDeleteShift = (id: string) => {
    setShiftToDelete(id);
    setIsDeleteDialogOpen(true);
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
      
      <ShiftListFilters 
        onUserFilter={(userIds) => {
          // For backward compatibility, update first user selection
          const firstUserId = userIds.length > 0 ? userIds[0] : null;
          setUserFilter(firstUserId);
        }}
        onDateFilter={setDateFilter}
        isAdminOrSocio={isAdminOrSocio}
        selectedUserIds={selectedUserIds}
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
              <TableHead className="w-[150px]">Azioni</TableHead>
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
                  onDeleteShift={isAdminOrSocio ? handleDeleteShift : undefined}
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
      
      {/* Confirmation dialog for deleting shifts */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma Eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo turno? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
