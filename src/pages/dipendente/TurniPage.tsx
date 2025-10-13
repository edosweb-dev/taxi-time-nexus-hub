import { useState, useEffect } from 'react';
import { DipendenteLayout } from '@/components/layouts/DipendenteLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MonthNavigation } from '@/components/dipendente/turni/MonthNavigation';
import { TurniCalendar } from '@/components/dipendente/turni/TurniCalendar';
import { CalendarLegenda } from '@/components/dipendente/turni/CalendarLegenda';
import { TurnoDetailSheet } from '@/components/dipendente/turni/TurnoDetailSheet';
import { useTurniMese } from '@/hooks/dipendente/useTurniMese';
import { CalendarDay, Shift } from '@/lib/utils/turniHelpers';
import { addMonths, subMonths } from 'date-fns';

export default function TurniPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTurno, setSelectedTurno] = useState<Shift | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: turni = [], isLoading } = useTurniMese(year, month);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePreviousMonth();
      } else if (e.key === 'ArrowRight') {
        handleNextMonth();
      } else if (e.key === 'Home') {
        handleToday();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate]);

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.turno) {
      setSelectedTurno(day.turno);
      setDetailSheetOpen(true);
    } else {
      // TODO: Open new turno dialog with preselected date
      console.log('Create new turno for', day.date);
    }
  };

  const handleCloseDetail = () => {
    setDetailSheetOpen(false);
    setSelectedTurno(null);
  };

  const handleEdit = (turno: Shift) => {
    // TODO: Open edit turno dialog
    console.log('Edit turno', turno);
    setDetailSheetOpen(false);
  };

  const handleDelete = (turno: Shift) => {
    // TODO: Open delete confirmation dialog
    console.log('Delete turno', turno);
    setDetailSheetOpen(false);
  };

  return (
    <DipendenteLayout>
      <div className="space-y-6 p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🕐 I Miei Turni
          </h1>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo Turno</span>
          </Button>
        </div>

        {/* Month Navigation */}
        <MonthNavigation
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {/* Calendar */}
        <TurniCalendar
          year={year}
          month={month}
          turni={turni}
          isLoading={isLoading}
          onDayClick={handleDayClick}
        />

        {/* Legenda */}
        <CalendarLegenda />

        {/* Detail Sheet */}
        <TurnoDetailSheet
          turno={selectedTurno}
          isOpen={detailSheetOpen}
          onClose={handleCloseDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DipendenteLayout>
  );
}
