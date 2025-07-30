import React, { useState, useMemo } from 'react';
import { format, startOfDay, endOfDay, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowLeft, Clock, MapPin, Building2, User, Calendar as CalendarIcon, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { Azienda } from '@/lib/types';
import { useServizi } from '@/hooks/useServizi';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';

export default function CalendarioServiziPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { servizi, isLoading } = useServizi();
  const { users } = useUsers();
  const { aziende } = useAziende();

  // Generate time slots (24 hours)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // Filter services for selected date
  const dayServizi = useMemo(() => {
    if (!servizi) return [];
    
    const startDate = startOfDay(selectedDate);
    const endDate = endOfDay(selectedDate);
    
    return servizi.filter(servizio => {
      const serviceDate = new Date(servizio.data_servizio);
      return serviceDate >= startDate && serviceDate <= endDate;
    });
  }, [servizi, selectedDate]);

  // Group services by assignee
  const serviziByAssignee = useMemo(() => {
    const grouped: Record<string, Servizio[]> = {};
    
    // Add unassigned group
    grouped['unassigned'] = [];
    
    // Add assignee groups
    users?.forEach(user => {
      if (user.role === 'dipendente' || user.role === 'admin' || user.role === 'socio') {
        grouped[user.id] = [];
      }
    });

    // Distribute services
    dayServizi.forEach(servizio => {
      const assigneeId = servizio.assegnato_a || 'unassigned';
      if (grouped[assigneeId]) {
        grouped[assigneeId].push(servizio);
      } else {
        grouped['unassigned'].push(servizio);
      }
    });

    // Remove empty groups except unassigned
    Object.keys(grouped).forEach(key => {
      if (key !== 'unassigned' && grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
  }, [dayServizi, users]);

  const getAssigneeName = (assigneeId: string) => {
    if (assigneeId === 'unassigned') return 'Non assegnati';
    const user = users?.find(u => u.id === assigneeId);
    return user ? `${user.first_name} ${user.last_name}` : 'Sconosciuto';
  };

  const getAssigneeColor = (assigneeId: string) => {
    if (assigneeId === 'unassigned') return '#6B7280';
    const user = users?.find(u => u.id === assigneeId);
    return user?.color || '#6B7280';
  };

  const getAziendaName = (aziendaId: string) => {
    const azienda = aziende?.find(a => a.id === aziendaId);
    return azienda?.nome || 'Azienda sconosciuta';
  };

  const getServiceTime = (servizio: Servizio) => {
    if (!servizio.orario_servizio) return '12:00';
    return servizio.orario_servizio.slice(0, 5); // Remove seconds
  };

  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'da_assegnare': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'assegnato': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'completato': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'annullato': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'non_accettato': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'consuntivato': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusLabel = (stato: string) => {
    switch (stato) {
      case 'da_assegnare': return 'Da assegnare';
      case 'assegnato': return 'Assegnato';
      case 'completato': return 'Completato';
      case 'annullato': return 'Annullato';
      case 'non_accettato': return 'Non accettato';
      case 'consuntivato': return 'Consuntivato';
      default: return stato;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Oggi';
    if (isYesterday(date)) return 'Ieri';
    if (isTomorrow(date)) return 'Domani';
    return format(date, 'EEEE d MMMM', { locale: it });
  };

  const handleNavigateToDetail = (id: string) => {
    navigate(`/servizi/${id}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header con gradiente */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50 p-6 border border-blue-200/50 dark:border-blue-800/50">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/servizi')}
                  className="hover-scale bg-white/80 hover:bg-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Torna ai Servizi
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <CalendarIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    Calendario Servizi
                  </h1>
                  <p className="text-muted-foreground mt-1 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Vista calendario giornaliera - {dayServizi.length} servizi programmati
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigazione date migliorata */}
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateDate('prev')}
                  className="hover-scale gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isYesterday(subDays(selectedDate, 1)) ? 'Ieri' : format(subDays(selectedDate, 1), 'dd/MM', { locale: it })}
                  </span>
                </Button>
                <Button 
                  variant={isToday(selectedDate) ? "default" : "outline"} 
                  size="sm" 
                  onClick={goToToday}
                  className="hover-scale"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Oggi
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateDate('next')}
                  className="hover-scale gap-2"
                >
                  <span className="hidden sm:inline">
                    {isTomorrow(addDays(selectedDate, 1)) ? 'Domani' : format(addDays(selectedDate, 1), 'dd/MM', { locale: it })}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {getDateLabel(selectedDate)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'yyyy', { locale: it })}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{Object.keys(serviziByAssignee).length}</span>
                  <span className="text-muted-foreground">operatori</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Griglia calendario ottimizzata */}
        <div className="bg-white dark:bg-gray-950 rounded-xl border shadow-sm overflow-hidden min-h-[700px]">
          {Object.keys(serviziByAssignee).length === 0 ? (
            // Empty State migliorato
            <div className="flex items-center justify-center h-[500px] animate-fade-in">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-10 w-10 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Nessun servizio programmato</h3>
                  <p className="text-muted-foreground max-w-md">
                    Non ci sono servizi pianificati per {getDateLabel(selectedDate).toLowerCase()}. 
                    Seleziona una data diversa o aggiungi nuovi servizi.
                  </p>
                </div>
                <div className="flex gap-2 justify-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/nuovo-servizio')}
                    className="hover-scale"
                  >
                    Nuovo Servizio
                  </Button>
                  <Button 
                    onClick={goToToday}
                    className="hover-scale"
                  >
                    Vai a Oggi
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-full animate-scale-in" style={{ gridTemplateColumns: `repeat(${Object.keys(serviziByAssignee).length}, 1fr)` }}>
              {/* Intestazioni colonne migliorate */}
              <div className="contents">
                {Object.keys(serviziByAssignee).map((assigneeId, index) => (
                  <div 
                    key={`header-${assigneeId}`} 
                    className="border-b border-r p-6 bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 hover:from-gray-100/80 hover:to-gray-200/50 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50 transition-all duration-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-900 shadow-sm"
                          style={{ backgroundColor: getAssigneeColor(assigneeId) }}
                        />
                        <div 
                          className="absolute -top-1 -right-1 w-3 h-3 rounded-full ring-1 ring-white dark:ring-gray-900"
                          style={{ backgroundColor: `${getAssigneeColor(assigneeId)}80` }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">
                          {getAssigneeName(assigneeId)}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-2 py-1"
                            style={{ 
                              backgroundColor: `${getAssigneeColor(assigneeId)}20`,
                              color: getAssigneeColor(assigneeId),
                              borderColor: `${getAssigneeColor(assigneeId)}40`
                            }}
                          >
                            {serviziByAssignee[assigneeId].length} servizi
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contenuto calendario migliorato */}
              <div className="contents">
                {Object.keys(serviziByAssignee).map((assigneeId, columnIndex) => (
                  <div 
                    key={`content-${assigneeId}`} 
                    className="border-r p-4 space-y-3 min-h-[600px] bg-gradient-to-b from-white to-gray-50/30 dark:from-gray-950 dark:to-gray-900/30"
                    style={{ animationDelay: `${columnIndex * 150}ms` }}
                  >
                    {serviziByAssignee[assigneeId]
                      .sort((a, b) => {
                        const timeA = getServiceTime(a);
                        const timeB = getServiceTime(b);
                        return timeA.localeCompare(timeB);
                      })
                      .map((servizio, serviceIndex) => (
                        <Card 
                          key={servizio.id} 
                          className="group p-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 bg-white dark:bg-gray-900 overflow-hidden relative animate-fade-in"
                          style={{ 
                            borderLeftColor: getAssigneeColor(assigneeId),
                            animationDelay: `${(columnIndex * 150) + (serviceIndex * 50)}ms`
                          }}
                          onClick={() => handleNavigateToDetail(servizio.id)}
                        >
                          {/* Sfondo decorativo */}
                          <div 
                            className="absolute top-0 right-0 w-16 h-16 opacity-5 -mr-8 -mt-8 rotate-12"
                            style={{ backgroundColor: getAssigneeColor(assigneeId) }}
                          />
                          
                          <div className="space-y-3 relative z-10">
                            {/* Header del servizio */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-semibold text-base">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                                {getServiceTime(servizio)}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs font-medium transition-colors group-hover:scale-105 ${getStatusColor(servizio.stato)}`}
                              >
                                {getStatusLabel(servizio.stato)}
                              </Badge>
                            </div>

                            {/* Informazioni azienda e commessa */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/50">
                                  <Building2 className="h-4 w-4 text-orange-600" />
                                </div>
                                <span className="font-medium text-foreground truncate">
                                  {getAziendaName(servizio.azienda_id)}
                                </span>
                              </div>
                              {servizio.numero_commessa && (
                                <div className="inline-flex items-center gap-2 text-xs font-mono bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 px-3 py-1.5 rounded-lg border">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  Commessa #{servizio.numero_commessa}
                                </div>
                              )}
                            </div>

                            {/* Informazioni percorso */}
                            <div className="space-y-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-3">
                              <div className="flex items-start gap-3 text-sm">
                                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/50">
                                  <MapPin className="h-3 w-3 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-green-700 dark:text-green-400 text-xs uppercase tracking-wide">
                                    Partenza
                                  </div>
                                  <div className="text-sm text-foreground mt-0.5 line-clamp-2">
                                    {servizio.indirizzo_presa}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border-l-2 border-dashed border-gray-300 dark:border-gray-600 ml-4 h-4"></div>
                              
                              <div className="flex items-start gap-3 text-sm">
                                <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/50">
                                  <MapPin className="h-3 w-3 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-red-700 dark:text-red-400 text-xs uppercase tracking-wide">
                                    Destinazione
                                  </div>
                                  <div className="text-sm text-foreground mt-0.5 line-clamp-2">
                                    {servizio.indirizzo_destinazione}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Note */}
                            {servizio.note && (
                              <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-3">
                                <div className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                  Note
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {servizio.note.slice(0, 100)}{servizio.note.length > 100 ? '...' : ''}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}