import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { MobileDayView } from './MobileDayView';
import { useShifts } from '@/components/shifts/ShiftContext';
import { Shift } from '@/components/shifts/types';
import { EditShiftDialog } from '@/components/shifts/dialogs/EditShiftDialog';
import { ShiftQuickViewDialog } from '@/components/shifts/dialogs/ShiftQuickViewDialog';

interface MobileCalendarioViewProps {
  isAdminOrSocio: boolean;
}

export function MobileCalendarioView({ isAdminOrSocio }: MobileCalendarioViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startX, setStartX] = useState(0);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
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
    <div className="mobile-calendario w-full px-0">
      {/* Header Mobile - Compatto */}
      <div className="w-full mobile-calendario-header-compact px-0">
        <div className="header-controls-compact">
          <TouchOptimizer minSize="lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevDay}
              className="nav-button-compact"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </TouchOptimizer>

          <div className="date-display-compact">
            <h2 className="current-date-compact">
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
            </h2>
          </div>
          
          <TouchOptimizer minSize="lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextDay}
              className="nav-button-compact"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </TouchOptimizer>
        </div>

        {/* Action buttons - Compatto */}
        <div className="flex gap-2">
          <TouchOptimizer minSize="md">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="today-button-compact"
            >
              Oggi
            </Button>
          </TouchOptimizer>

          {/* Date Picker - Solo Mobile */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("h-9 w-9 p-0 flex items-center justify-center")}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="center">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) {
                    setCurrentDate(date);
                    setDatePickerOpen(false);
                  }
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                locale={it}
              />
            </PopoverContent>
          </Popover>
        </div>
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
          onEditShift={handleEditShift}
        />
      </div>

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
    </div>
  );
}