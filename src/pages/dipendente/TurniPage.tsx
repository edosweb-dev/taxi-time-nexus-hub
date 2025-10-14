import { useState, useEffect } from 'react';
import { DipendenteLayout } from '@/components/layouts/DipendenteLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { MonthNavigation } from '@/components/dipendente/turni/MonthNavigation';
import { TurniCalendar } from '@/components/dipendente/turni/TurniCalendar';
import { CalendarLegenda } from '@/components/dipendente/turni/CalendarLegenda';
import { TurnoDetailSheet } from '@/components/dipendente/turni/TurnoDetailSheet';
import { NuovoTurnoSheet } from '@/components/dipendente/turni/NuovoTurnoSheet';
import { ModificaTurnoSheet } from '@/components/dipendente/turni/ModificaTurnoSheet';
import { EliminaTurnoDialog } from '@/components/dipendente/turni/EliminaTurnoDialog';
import { MobileTurniView } from '@/components/dipendente/turni/MobileTurniView';
import { useTurniMese } from '@/hooks/dipendente/useTurniMese';
import { useTurnoCRUD } from '@/hooks/dipendente/useTurnoCRUD';
import { CalendarDay, Shift } from '@/lib/utils/turniHelpers';
import { addMonths, subMonths } from 'date-fns';
import { useLayout } from '@/contexts/LayoutContext';
import { useIsMobile } from '@/hooks/use-mobile';


export default function TurniPage() {
  const { setPaddingMode } = useLayout();
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTurno, setSelectedTurno] = useState<Shift | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [nuovoTurnoOpen, setNuovoTurnoOpen] = useState(false);
  const [modificaTurnoOpen, setModificaTurnoOpen] = useState(false);
  const [eliminaTurnoOpen, setEliminaTurnoOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: turni = [], isLoading, error } = useTurniMese(year, month);
  const { createTurno, updateTurno, deleteTurno, isCreating, isUpdating, isDeleting } = useTurnoCRUD();

  // Debug logging
  console.log('[TurniPage] Turni caricati:', turni?.length || 0, turni);
  console.log('[TurniPage] Error:', error);
  console.log('[TurniPage] Loading:', isLoading);

  // Layout setup - same as CalendarioTurniPage
  useEffect(() => {
    if (isMobile) {
      setPaddingMode('full-width');
    }
    return () => setPaddingMode('default');
  }, [isMobile, setPaddingMode]);

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
      setSelectedDate(day.date);
      setNuovoTurnoOpen(true);
    }
  };

  const handleNewTurnoClick = () => {
    setSelectedDate(null);
    setNuovoTurnoOpen(true);
  };

  const handleTurnoClick = (turno: Shift) => {
    setSelectedTurno(turno);
    setDetailSheetOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailSheetOpen(false);
    setSelectedTurno(null);
  };

  const handleEdit = (turno: Shift) => {
    setSelectedTurno(turno);
    setDetailSheetOpen(false);
    setModificaTurnoOpen(true);
  };

  const handleDelete = (turno: Shift) => {
    setSelectedTurno(turno);
    setDetailSheetOpen(false);
    setEliminaTurnoOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedTurno) {
      await deleteTurno(selectedTurno.id);
      setEliminaTurnoOpen(false);
      setSelectedTurno(null);
    }
  };

  return (
    <DipendenteLayout>
      <div className="w-full px-0 md:px-4">
        <div className="flex flex-col items-start w-full">
          {isMobile ? (
            <MobileTurniView
              onNewTurno={handleNewTurnoClick}
              onTurnoClick={handleTurnoClick}
            />
          ) : (
            <>
              {/* Header Section */}
              <div className="w-full px-4 md:px-0 py-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">I Miei Turni</h1>
                  <Button size="sm" className="gap-2" onClick={handleNewTurnoClick}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nuovo Turno</span>
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm">
                  Gestisci i tuoi turni di lavoro
                </p>
              </div>

              {/* Content Section */}
              <div className="w-full px-4 md:px-0 pb-32 md:pb-8 space-y-6">
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
              </div>
            </>
          )}
        </div>

        {/* Detail Sheet */}
        <TurnoDetailSheet
          turno={selectedTurno}
          isOpen={detailSheetOpen}
          onClose={handleCloseDetail}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Nuovo Turno Sheet */}
        <NuovoTurnoSheet
          isOpen={nuovoTurnoOpen}
          onClose={() => setNuovoTurnoOpen(false)}
          onSubmit={async (data) => {
            await createTurno(data);
          }}
          defaultDate={selectedDate || undefined}
          isLoading={isCreating}
        />

        {/* Modifica Turno Sheet */}
        <ModificaTurnoSheet
          turno={selectedTurno}
          isOpen={modificaTurnoOpen}
          onClose={() => setModificaTurnoOpen(false)}
          onSubmit={async (data) => {
            if (selectedTurno) {
              await updateTurno({ turnoId: selectedTurno.id, data });
            }
          }}
          isLoading={isUpdating}
        />

        {/* Elimina Turno Dialog */}
        <EliminaTurnoDialog
          turno={selectedTurno}
          isOpen={eliminaTurnoOpen}
          onClose={() => setEliminaTurnoOpen(false)}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />
      </div>
    </DipendenteLayout>
  );
}
