import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';
import { MobileCalendarioGrid } from './MobileCalendarioGrid';
import { MobileListaView } from './MobileListaView';
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
  const [view, setView] = useState<'lista' | 'calendario'>('lista');
  const [startX, setStartX] = useState(0);
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [editShiftDialogOpen, setEditShiftDialogOpen] = useState(false);
  const [quickViewDialogOpen, setQuickViewDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { shifts, isLoading } = useShifts();

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
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
        handleNextMonth(); // Swipe left = mese successivo
      } else {
        handlePrevMonth(); // Swipe right = mese precedente
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
              onClick={handlePrevMonth}
              className="nav-button"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </TouchOptimizer>
          
          <h2 className="current-month">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </h2>
          
          <TouchOptimizer minSize="lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="nav-button"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </TouchOptimizer>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <TouchOptimizer minSize="lg">
            <Button
              variant={view === 'lista' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('lista')}
              className="toggle-button"
            >
              <List className="w-4 h-4 mr-2" />
              Lista
            </Button>
          </TouchOptimizer>
          <TouchOptimizer minSize="lg">
            <Button
              variant={view === 'calendario' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('calendario')}
              className="toggle-button"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendario
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
        {view === 'lista' ? (
          <MobileListaView 
            currentDate={currentDate} 
            shifts={shifts}
            isLoading={isLoading}
            onCreateShift={handleCreateShift}
            onEditShift={handleEditShift}
          />
        ) : (
          <MobileCalendarioGrid 
            currentDate={currentDate}
            shifts={shifts}
            isLoading={isLoading}
            onCreateShift={handleCreateShift}
            onEditShift={handleEditShift}
          />
        )}
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