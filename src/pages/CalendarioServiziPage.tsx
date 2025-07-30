import React, { useState, useMemo } from 'react';
import { format, startOfDay, endOfDay, addDays, subDays, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowLeft, Clock, MapPin, Building2, Home, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const handleNavigateToDetail = (id: string) => {
    navigate(`/servizi/${id}`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con breadcrumb - stile coerente */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span 
              className="cursor-pointer hover:text-foreground" 
              onClick={() => navigate('/servizi')}
            >
              Servizi
            </span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Calendario</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title flex items-center gap-2">
                <CalendarIcon className="h-8 w-8" />
                Calendario Servizi
              </h1>
              <p className="text-description">
                Vista calendario giornaliera - {dayServizi.length} servizi programmati
              </p>
            </div>
          </div>
        </div>

        {/* Navigazione date - layout ottimizzato */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Controlli navigazione */}
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <Button variant="outline" size="sm" onClick={() => navigateDate('prev')} className="min-w-[100px]">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Precedente
                </Button>
                <Button 
                  variant={isToday(selectedDate) ? "default" : "outline"} 
                  size="sm" 
                  onClick={goToToday}
                  className="min-w-[80px]"
                >
                  Oggi
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateDate('next')} className="min-w-[100px]">
                  Successivo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              {/* Data centrale */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
                </h2>
              </div>
              
              {/* Info operatori */}
              <div className="flex items-center justify-center lg:justify-end">
                <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg">
                  <span className="font-medium">{Object.keys(serviziByAssignee).length}</span> operatori attivi
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendario grid - stile standard */}
        <div className="bg-white dark:bg-gray-950 rounded-lg border min-h-[600px]">
          {Object.keys(serviziByAssignee).length === 0 ? (
            // Empty State standard
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center text-muted-foreground">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nessun servizio per questa giornata</h3>
                <p>Seleziona una data diversa o aggiungi nuovi servizi</p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button variant="outline" onClick={() => navigate('/nuovo-servizio')}>
                    Nuovo Servizio
                  </Button>
                  <Button onClick={goToToday}>
                    Vai a Oggi
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${Object.keys(serviziByAssignee).length}, 1fr)` }}>
              {/* Intestazioni colonne */}
              <div className="contents">
                {Object.keys(serviziByAssignee).map(assigneeId => (
                  <div key={`header-${assigneeId}`} className="border-b border-r p-4 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getAssigneeColor(assigneeId) }}
                      />
                      <div>
                        <h3 className="font-medium text-sm">{getAssigneeName(assigneeId)}</h3>
                        <p className="text-xs text-muted-foreground">
                          {serviziByAssignee[assigneeId].length} servizi
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contenuto calendario */}
              <div className="contents">
                {Object.keys(serviziByAssignee).map(assigneeId => (
                  <div key={`content-${assigneeId}`} className="border-r p-4 space-y-3 min-h-[600px]">
                    {serviziByAssignee[assigneeId]
                      .sort((a, b) => {
                        const timeA = getServiceTime(a);
                        const timeB = getServiceTime(b);
                        return timeA.localeCompare(timeB);
                      })
                      .map(servizio => (
                        <Card 
                          key={servizio.id} 
                          className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4"
                          style={{ 
                            borderLeftColor: getAssigneeColor(assigneeId),
                            backgroundColor: `${getAssigneeColor(assigneeId)}08`
                          }}
                          onClick={() => handleNavigateToDetail(servizio.id)}
                        >
                          <div className="space-y-3">
                            {/* Orario e stato */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 font-semibold text-sm">
                                <Clock className="h-4 w-4" />
                                {getServiceTime(servizio)}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(servizio.stato)}`}
                              >
                                {getStatusLabel(servizio.stato)}
                              </Badge>
                            </div>

                            {/* Azienda e commessa */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                <span className="font-medium">{getAziendaName(servizio.azienda_id)}</span>
                              </div>
                              {servizio.numero_commessa && (
                                <div className="text-xs font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                  Commessa #{servizio.numero_commessa}
                                </div>
                              )}
                            </div>

                            {/* Percorso */}
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-green-700 dark:text-green-400">Partenza</div>
                                  <div className="text-xs text-muted-foreground line-clamp-2">
                                    {servizio.indirizzo_presa}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 mt-0.5 text-red-600 flex-shrink-0" />
                                <div>
                                  <div className="font-medium text-red-700 dark:text-red-400">Destinazione</div>
                                  <div className="text-xs text-muted-foreground line-clamp-2">
                                    {servizio.indirizzo_destinazione}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Note */}
                            {servizio.note && (
                              <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded italic">
                                {servizio.note.slice(0, 80)}{servizio.note.length > 80 ? '...' : ''}
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