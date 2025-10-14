import { useAuth } from "@/contexts/AuthContext";
import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { format, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { useDipendenteDashboard } from "@/hooks/dipendente/useDipendenteDashboard";
import { Calendar, Car, TrendingUp, Euro, Coffee, MapPin, Clock, MessageCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DipendenteDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { serviziOggi, statisticheMese, ultimoStipendio, turniSettimana, isLoading } = useDipendenteDashboard();

  // Generate week days (Monday to Sunday)
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  });

  // Create map of shifts by date
  const shiftsMap = new Map(
    (turniSettimana.data || []).map(shift => [shift.shift_date, shift])
  );

  const getShiftTimeDisplay = (shift: any) => {
    if (shift.shift_type === 'full_day') return '8-16';
    if (shift.shift_type === 'half_day' && shift.half_day_type === 'morning') return '8-12';
    if (shift.shift_type === 'half_day' && shift.half_day_type === 'afternoon') return '14-18';
    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
      return `${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}`;
    }
    return '-';
  };

  const handleDayClick = (day: Date) => {
    const dateParam = format(day, 'yyyy-MM-dd');
    navigate(`/calendario-turni?date=${dateParam}&view=day`);
  };

  const serviziCompletatiOggi = (serviziOggi.data || []).filter(s => s.stato === 'completato').length;
  const serviziTotaliOggi = (serviziOggi.data || []).length;

  return (
    <DipendenteLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header Personalizzato */}
        <div className="p-4 md:p-6 bg-gradient-to-r from-primary/5 via-background to-secondary/5 rounded-xl border border-border/30 shadow-sm backdrop-blur-sm -mx-4 md:-mx-6 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1 md:space-y-2">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                Ciao, {profile?.first_name}!
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {format(new Date(), "EEEE d MMMM yyyy", { locale: it })}
              </p>
            </div>
            
            {profile?.color && (
              <div className="flex items-center gap-2">
                <Badge 
                  style={{ backgroundColor: profile.color }}
                  className="text-white text-xs md:text-sm px-3 py-1"
                >
                  Dipendente
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Card 1 - Servizi Oggi */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servizi Oggi</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {serviziCompletatiOggi}/{serviziTotaliOggi}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {serviziCompletatiOggi} completati
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 2 - Statistiche Mese */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Statistiche Mese</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {statisticheMese.data?.serviziCompletati || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    servizi | {statisticheMese.data?.kmTotali || 0} km
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Card 3 - Ultimo Stipendio */}
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/dipendente/stipendi')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ultimo Stipendio</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : ultimoStipendio.data ? (
                <>
                  <div className="text-2xl font-bold">
                    €{ultimoStipendio.data.totale_netto?.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(ultimoStipendio.data.anno, ultimoStipendio.data.mese - 1), 'MMMM yyyy', { locale: it })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Nessuno stipendio</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Servizi Oggi */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>I Miei Servizi Oggi</CardTitle>
                {!isLoading && serviziTotaliOggi > 0 && (
                  <Badge variant="secondary">{serviziTotaliOggi}</Badge>
                )}
              </div>
              {!isLoading && serviziTotaliOggi > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dipendente/servizi-assegnati')}
                >
                  Vedi tutti
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : serviziOggi.data && serviziOggi.data.length > 0 ? (
              <div className="space-y-3">
                {serviziOggi.data.slice(0, 5).map((servizio) => (
                  <Card 
                    key={servizio.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/dipendente/servizi-assegnati/${servizio.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={
                          servizio.stato === 'completato' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                        }>
                          {servizio.stato === 'completato' ? '🟢' : '🟡'} {servizio.stato}
                        </Badge>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {servizio.orario_servizio?.slice(0, 5)}
                        </span>
                      </div>
                      <p className="font-semibold mb-2">{servizio.aziende?.nome || 'Azienda non specificata'}</p>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="flex-1">{servizio.indirizzo_presa} → {servizio.indirizzo_destinazione}</span>
                        </p>
                        {servizio.veicoli && (
                          <p className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            {servizio.veicoli.modello} - {servizio.veicoli.targa}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {serviziOggi.data.length > 5 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/dipendente/servizi-assegnati')}
                  >
                    Vedi altri {serviziOggi.data.length - 5} servizi
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Coffee className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nessun servizio oggi 🎉</h3>
                <p className="text-muted-foreground mb-4">
                  Goditi la giornata!
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/dipendente/servizi-assegnati')}
                >
                  Vedi tutti i servizi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Turni Settimana */}
        <Card>
          <CardHeader>
            <CardTitle>Turni Questa Settimana</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <Skeleton key={i} className="flex-shrink-0 w-20 h-24" />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {weekDays.map(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const shift = shiftsMap.get(dateKey);
                  const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <div 
                      key={day.toString()} 
                      className={cn(
                        "flex-shrink-0 w-20 text-center cursor-pointer group rounded-lg p-2 transition-all",
                        shift && "shadow-sm"
                      )}
                      style={{
                        backgroundColor: shift && profile?.color ? profile.color : undefined
                      }}
                      onClick={() => handleDayClick(day)}
                    >
                      <p className={cn(
                        "text-xs font-medium mb-2",
                        isToday && "text-primary font-bold"
                      )}>
                        {format(day, 'EEE', { locale: it })}
                      </p>
                      <div 
                        className={cn(
                          "w-12 h-12 rounded-full mx-auto mb-1 flex items-center justify-center transition-all",
                          shift 
                            ? "ring-2 ring-offset-2 group-hover:scale-110 group-hover:ring-primary" 
                            : "bg-muted group-hover:bg-muted/80 group-hover:scale-105",
                          isToday && shift && "ring-primary"
                        )}
                        style={{ 
                          backgroundColor: shift ? profile?.color : undefined
                        }}
                      >
                        <span className={cn(
                          "text-xs font-bold",
                          shift ? "text-white" : "text-muted-foreground"
                        )}>
                          {format(day, 'd')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {shift ? getShiftTimeDisplay(shift) : '-'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 md:mb-6">
          <Button 
            onClick={() => navigate('/dipendente/servizi-assegnati')}
            className="h-auto py-4 flex-col gap-2 min-h-[44px]"
          >
            <Calendar className="h-5 w-5" />
            <span className="text-sm">Servizi Assegnati</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/dipendente/turni')}
            className="h-auto py-4 flex-col gap-2 min-h-[44px]"
          >
            <Clock className="h-5 w-5" />
            <span className="text-sm">Gestisci Turni</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/dipendente/spese')}
            className="h-auto py-4 flex-col gap-2 min-h-[44px]"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Aggiungi Spesa</span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/feedback')}
            className="h-auto py-4 flex-col gap-2 min-h-[44px]"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">Invia Feedback</span>
          </Button>
        </div>

        {/* Safety spacer - invisible buffer above footer on mobile */}
        <div className="h-24 md:h-0" aria-hidden="true" />
      </div>
    </DipendenteLayout>
  );
}
