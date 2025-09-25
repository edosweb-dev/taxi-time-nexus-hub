import React, { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addDays, subDays, format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layouts/MainLayout';
import { CalendarView } from '@/components/calendario/CalendarView';
import { useServizi } from '@/hooks/useServizi';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';

type ViewMode = 'month' | 'week' | 'day';

export default function CalendarioPage() {
  const navigate = useNavigate();
  const { servizi = [], isLoading } = useServizi();
  const { users = [] } = useUsers();
  const { aziende = [] } = useAziende();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const navigateDate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    setCurrentDate(direction === 'prev' ? subDays(currentDate, days) : addDays(currentDate, days));
  };

  const goToToday = () => setCurrentDate(new Date());

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6" />
                  Calendario Servizi
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')} className="min-h-[44px]">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday} className="min-h-[44px]">
                Oggi
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')} className="min-h-[44px]">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="min-h-[44px]"
                >
                  {mode === 'day' ? 'Giorno' : mode === 'week' ? 'Settimana' : 'Mese'}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold">
              {format(currentDate, viewMode === 'day' ? 'EEEE d MMMM yyyy' : 'MMMM yyyy', { locale: it })}
            </h2>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-4">
          <CalendarView
            servizi={servizi}
            aziende={aziende}
            users={users}
            currentDate={currentDate}
            viewMode={viewMode}
            onNavigateToDetail={(id) => navigate(`/servizi/${id}`)}
            onDateSelect={setCurrentDate}
          />
        </div>
      </div>
    </MainLayout>
  );
}