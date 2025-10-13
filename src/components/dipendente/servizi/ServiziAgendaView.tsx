import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useServiziAgenda, getServiziByDay } from '@/hooks/dipendente/useServiziAgenda';
import { AgendaCalendar } from './agenda/AgendaCalendar';
import { AgendaDay } from './agenda/AgendaDay';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiziAgendaViewProps {
  filtri?: {
    stati?: string[];
    aziendaId?: string;
  };
  onServizioClick: (id: string) => void;
  onCompleta?: (id: string) => void;
}

export function ServiziAgendaView({ filtri, onServizioClick, onCompleta }: ServiziAgendaViewProps) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: servizi, isLoading } = useServiziAgenda({
    userId: user?.id || '',
    month: getMonth(currentDate) + 1,
    year: getYear(currentDate),
    filtri
  });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDay(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
  };

  const serviziGiorno = selectedDay ? getServiziByDay(servizi || [], selectedDay) : [];

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          onClick={handleToday}
          className="gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          Oggi
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <>
          {/* Calendar Grid */}
          <AgendaCalendar
            date={currentDate}
            servizi={servizi || []}
            onDayClick={handleDayClick}
            selectedDay={selectedDay}
          />

          {/* Selected Day Detail */}
          <AgendaDay
            date={selectedDay}
            servizi={serviziGiorno}
            onClose={() => setSelectedDay(null)}
            onServizioClick={onServizioClick}
            onCompleta={onCompleta}
            isMobile={isMobile}
          />
        </>
      )}
    </div>
  );
}
