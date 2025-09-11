import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';
import { MobileDayView } from './MobileDayView';
import { useShifts } from '@/components/shifts/ShiftContext';
import { Shift } from '@/components/shifts/types';
import { AddShiftDialog } from '@/components/shifts/AddShiftDialog';
import { EditShiftDialog } from '@/components/shifts/dialogs/EditShiftDialog';
import { ShiftQuickViewDialog } from '@/components/shifts/dialogs/ShiftQuickViewDialog';

interface MobileCalendarioViewProps {
  isAdminOrSocio: boolean;
}

export function MobileCalendarioView({ isAdminOrSocio }: MobileCalendarioViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startX, setStartX] = useState(0);
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [editShiftDialogOpen, setEditShiftDialogOpen] = useState(false);
  const [quickViewDialogOpen, setQuickViewDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { shifts, isLoading, loadShifts } = useShifts();

  // Load shifts for current day
  useEffect(() => {
    const start = startOfDay(currentDate);
    const end = endOfDay(currentDate);
    loadShifts(start, end);
  }, [currentDate, loadShifts]);

  const handlePrevDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) { // Threshold per swipe
      if (diff > 0) {
        handleNextDay(); // Swipe left = giorno successivo
      } else {
        handlePrevDay(); // Swipe right = giorno precedente
      }
    }
  };

  const handleCreateShift = (date: Date) => {
    setSelectedDate(date);
    setSelectedShift(null);
    setAddShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setQuickViewDialogOpen(true);
  };

  const handleEditFromQuickView = (shift: Shift) => {
    setQuickViewDialogOpen(false);
    setSelectedDate(new Date(shift.shift_date));
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
    <div className="mobile-calendario">
      {/* Header Mobile */}
      <div className="mobile-calendario-header">
        <div className="header-controls">
          <TouchOptimizer minSize="lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevDay}
              className="nav-button"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </TouchOptimizer>
          
          <div className="date-display">
            <h2 className="current-date">
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h2>
          </div>
          
          <TouchOptimizer minSize="lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              className="nav-button"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </TouchOptimizer>
        </div>

        {/* Today button */}
        <div className="today-button">
          <TouchOptimizer minSize="lg">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="w-full"
            >
              Oggi
            </Button>
          </TouchOptimizer>
        </div>

        {/* Action Button */}
        {isAdminOrSocio && (
          <div className="action-button">
            <TouchOptimizer minSize="lg">
              <Button 
                size="sm" 
                onClick={() => handleCreateShift(currentDate)} 
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Turno
              </Button>
            </TouchOptimizer>
          </div>
        )}
      </div>

      {/* Content con swipe */}
      <div
        className="mobile-calendario-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <MobileDayView 
          currentDate={currentDate} 
          shifts={shifts}
          isLoading={isLoading}
          onCreateShift={handleCreateShift}
          onEditShift={handleEditShift}
        />
      </div>

      {/* Dialogs */}
      <AddShiftDialog
        open={addShiftDialogOpen}
        onOpenChange={setAddShiftDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
        defaultDate={selectedDate}
      />

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
    </div>
  );
}