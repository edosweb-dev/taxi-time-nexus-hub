import React, { useState, useEffect } from 'react';
import { startOfDay, endOfDay } from 'date-fns';
import { MobileShiftDayView } from '@/components/shifts/mobile/MobileShiftDayView';
import { useShifts } from '@/components/shifts/ShiftContext';
import { Shift } from '@/components/shifts/types';
import { EditShiftDialog } from '@/components/shifts/dialogs/EditShiftDialog';
import { ShiftQuickViewDialog } from '@/components/shifts/dialogs/ShiftQuickViewDialog';

interface MobileCalendarioViewProps {
  isAdminOrSocio: boolean;
  filterUserId?: string;
}

export function MobileCalendarioView({ isAdminOrSocio, filterUserId }: MobileCalendarioViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editShiftDialogOpen, setEditShiftDialogOpen] = useState(false);
  const [quickViewDialogOpen, setQuickViewDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const { shifts, isLoading, loadShifts } = useShifts();

  // Load shifts for current day
  useEffect(() => {
    const start = startOfDay(currentDate);
    const end = endOfDay(currentDate);
    loadShifts(start, end);
  }, [currentDate, loadShifts]);

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setQuickViewDialogOpen(true);
  };

  const handleEditFromQuickView = (shift: Shift) => {
    setQuickViewDialogOpen(false);
    setEditShiftDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      // Logic will be implemented with shift mutations
      setQuickViewDialogOpen(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  return (
    <>
      <MobileShiftDayView
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        shifts={shifts}
        isLoading={isLoading}
        onEditShift={handleEditShift}
        showAddButton={isAdminOrSocio}
        showUserInfo={true}
      />

      {/* Dialogs */}
      <ShiftQuickViewDialog
        open={quickViewDialogOpen}
        onOpenChange={setQuickViewDialogOpen}
        shift={selectedShift}
        onEditShift={handleEditFromQuickView}
        onDeleteShift={handleDeleteShift}
        canEdit={isAdminOrSocio}
      />

      <EditShiftDialog
        open={editShiftDialogOpen}
        onOpenChange={setEditShiftDialogOpen}
        shift={selectedShift}
        isAdminOrSocio={isAdminOrSocio}
      />
    </>
  );
}