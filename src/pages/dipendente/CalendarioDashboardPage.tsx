import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, addDays, isToday, getMonth, getYear } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, CheckCircle, Coffee, MapPin, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold">
            Ciao, {profile?.first_name}! 👋
          </h1>
        </div>

        {/* Date Navigation */}
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 h-10 md:h-12 text-sm md:text-base font-semibold capitalize"
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
                className="h-10 w-10 flex-shrink-0"
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {!isToday(selectedDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => setSelectedDate(new Date())}
              >
                Vai a Oggi
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{stats.totale}</p>
              <p className="text-xs text-muted-foreground">Servizi</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completati}</p>
              <p className="text-xs text-muted-foreground">Completati</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-muted-foreground">{stats.totale - stats.completati - stats.annullati}</p>
              <p className="text-xs text-muted-foreground">Da fare</p>
            </CardContent>
          </Card>
        </div>

        {/* Service List */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Car className="h-5 w-5" />
            Servizi del giorno
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : serviziGiorno.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Coffee className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-semibold mb-1">Nessun servizio</p>
                <p className="text-sm text-muted-foreground">
                  {isToday(selectedDate) ? 'Nessun servizio oggi 🎉' : 'Nessun servizio in questa data'}
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
        <div className="h-24 md:h-0" aria-hidden="true" />
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
      assegnato: { label: 'Da completare', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', emoji: '🟡' },
      completato: { label: 'Completato', className: 'bg-green-100 text-green-800 border-green-200', emoji: '🟢' },
      consuntivato: { label: 'Consuntivato', className: 'bg-blue-100 text-blue-800 border-blue-200', emoji: '🔵' },
      annullato: { label: 'Annullato', className: 'bg-red-100 text-red-800 border-red-200', emoji: '🔴' },
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
      className={cn('cursor-pointer hover:shadow-md transition-shadow', getBorderColor(servizio.stato))}
      onClick={onDettagli}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: time + badge */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {servizio.orario_servizio?.slice(0, 5)}
          </span>
          <Badge variant="outline" className={cn('font-medium text-xs', badge.className)}>
            {badge.emoji} {badge.label}
          </Badge>
        </div>

        {/* Client */}
        <p className="font-semibold text-sm">{cliente}</p>

        {/* Route */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate">
              {servizio.citta_presa && <span className="font-medium">{servizio.citta_presa} - </span>}
              {servizio.indirizzo_presa}
            </p>
            <p className="truncate">
              → {servizio.citta_destinazione && <span className="font-medium">{servizio.citta_destinazione} - </span>}
              {servizio.indirizzo_destinazione}
            </p>
          </div>
        </div>

        {/* Vehicle */}
        {servizio.veicolo_modello && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Car className="h-3.5 w-3.5" />
            <span>{servizio.veicolo_modello}{servizio.veicolo_targa && ` - ${servizio.veicolo_targa}`}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          {canComplete && (
            <Button size="sm" className="flex-1 min-h-[40px]" onClick={onCompleta}>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Completa
            </Button>
          )}
          <Button variant="outline" size="sm" className={cn('min-h-[40px]', canComplete ? '' : 'flex-1')} onClick={onDettagli}>
            <Eye className="h-4 w-4 mr-1.5" />
            Dettagli
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
