import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, addDays, isToday, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, CheckCircle, Coffee, MapPin, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DipendenteLayout } from '@/components/layouts/DipendenteLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useServiziAgenda, getServiziByDay } from '@/hooks/dipendente/useServiziAgenda';
import { cn } from '@/lib/utils';
import { ServizioWithRelations } from '@/lib/api/dipendente/servizi';

export default function CalendarioDashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const { data: servizi, isLoading } = useServiziAgenda({
    userId: user?.id || '',
    month: getMonth(selectedDate) + 1,
    year: getYear(selectedDate),
  });

  const serviziGiorno = getServiziByDay(servizi || [], selectedDate);

  const stats = serviziGiorno.reduce(
    (acc, s) => {
      acc.totale++;
      if (['completato', 'consuntivato'].includes(s.stato)) acc.completati++;
      if (s.stato === 'annullato') acc.annullati++;
      return acc;
    },
    { totale: 0, completati: 0, annullati: 0 }
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCalendarOpen(false);
    }
  };

  return (
    <DipendenteLayout title="Dashboard">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-0">
          <h1 className="text-xl md:text-2xl font-bold">
            Ciao, {profile?.first_name}! 👋
          </h1>
        </div>

        {/* Date Navigation */}
        <div className="px-4 md:px-0">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 md:h-10 md:w-10 flex-shrink-0"
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 h-12 md:h-10 text-sm md:text-base font-semibold capitalize"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                      locale={it}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 md:h-10 md:w-10 flex-shrink-0"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {!isToday(selectedDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs h-11 md:h-9"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Vai a Oggi
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 px-4 md:px-0">
          <Card className="border-border/50">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold mb-1">{stats.totale}</p>
              <p className="text-xs text-muted-foreground font-medium">Servizi</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.completati}</p>
              <p className="text-xs text-muted-foreground font-medium">Completati</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="p-3 md:p-4 text-center">
              <p className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{stats.totale - stats.completati - stats.annullati}</p>
              <p className="text-xs text-muted-foreground font-medium">Da fare</p>
            </CardContent>
          </Card>
        </div>

        {/* Service List */}
        <div className="px-4 md:px-0">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Car className="h-5 w-5" />
            Servizi del giorno
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : serviziGiorno.length === 0 ? (
            <Card>
              <CardContent className="py-16 px-4 text-center">
                <div className="text-6xl mb-4">
                  {isToday(selectedDate) ? '🎉' : '📅'}
                </div>
                <p className="text-xl font-semibold mb-2">Nessun servizio</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {isToday(selectedDate)
                    ? 'Ottimo! Non hai servizi programmati per oggi.'
                    : 'Non ci sono servizi programmati per questa data.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {serviziGiorno.map((servizio) => (
                <CalendarioServizioCard
                  key={servizio.id}
                  servizio={servizio}
                  onDettagli={() => navigate(`/servizi/${servizio.id}`)}
                  onCompleta={() => navigate(`/dipendente/servizi-assegnati/${servizio.id}/completa`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Spacer for mobile bottom nav */}
        <div className="h-20 md:h-4" aria-hidden="true" />
      </div>
    </DipendenteLayout>
  );
}

// --- Card component ---
function CalendarioServizioCard({
  servizio,
  onDettagli,
  onCompleta
}: {
  servizio: ServizioWithRelations;
  onDettagli: () => void;
  onCompleta: () => void;
}) {
  const getStatoBadge = (stato: string) => {
    const configs: Record<string, { label: string; className: string; emoji: string }> = {
      assegnato: { label: 'Da completare', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800', emoji: '🟡' },
      completato: { label: 'Completato', className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800', emoji: '✅' },
      consuntivato: { label: 'Consuntivato', className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800', emoji: '💰' },
      annullato: { label: 'Annullato', className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800', emoji: '🚫' },
    };
    return configs[stato] || configs.assegnato;
  };

  const badge = getStatoBadge(servizio.stato);
  const canComplete = servizio.stato === 'assegnato';
  const cliente = servizio.tipo_cliente === 'privato'
    ? `${servizio.cliente_privato_nome || ''} ${servizio.cliente_privato_cognome || ''}`.trim() || 'Cliente privato'
    : servizio.azienda_nome || servizio.aziende?.nome || 'Azienda';

  const getBorderColor = (stato: string) => {
    const colors: Record<string, string> = {
      assegnato: 'border-l-4 border-l-yellow-400',
      completato: 'border-l-4 border-l-green-400',
      consuntivato: 'border-l-4 border-l-blue-400',
      annullato: 'border-l-4 border-l-red-400',
    };
    return colors[stato] || colors.assegnato;
  };

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200',
        getBorderColor(servizio.stato)
      )}
      onClick={onDettagli}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: time + badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl md:text-2xl font-bold tabular-nums flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {servizio.orario_servizio?.slice(0, 5)}
          </span>
          <span className={cn(
            'px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5',
            badge.className
          )}>
            <span>{badge.emoji}</span>
            <span className="hidden sm:inline">{badge.label}</span>
          </span>
        </div>

        {/* Client */}
        <p className="font-semibold text-base">{cliente}</p>

        {/* Route */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">📍</span>
            <div className="min-w-0 flex-1">
              <p className="truncate">
                {servizio.citta_presa && <span className="text-muted-foreground">{servizio.citta_presa} • </span>}
                {servizio.indirizzo_presa}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0">🎯</span>
            <div className="min-w-0 flex-1">
              <p className="truncate">
                {servizio.citta_destinazione && <span className="text-muted-foreground">{servizio.citta_destinazione} • </span>}
                {servizio.indirizzo_destinazione}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        {servizio.veicolo_modello && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-md">
            <Car className="h-3.5 w-3.5" />
            <span className="font-medium">
              {servizio.veicolo_modello}{servizio.veicolo_targa && ` • ${servizio.veicolo_targa}`}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          {canComplete && (
            <Button size="lg" className="flex-1 h-12 text-base font-semibold" onClick={onCompleta}>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Completa
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className={cn('h-12 text-base font-semibold', canComplete ? 'flex-1' : 'w-full')}
            onClick={onDettagli}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Dettagli
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
