import React, { useState, useMemo } from 'react';
import { format, startOfDay, endOfDay, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, User, Clock, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { Azienda } from '@/lib/types';

interface ServiziCalendarViewProps {
  servizi: Servizio[];
  users: Profile[];
  aziende: Azienda[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToDetail: (id: string) => void;
}

export function ServiziCalendarView({
  servizi,
  users,
  aziende,
  open,
  onOpenChange,
  onNavigateToDetail
}: ServiziCalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

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
    users.forEach(user => {
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
    const user = users.find(u => u.id === assigneeId);
    return user ? `${user.first_name} ${user.last_name}` : 'Sconosciuto';
  };

  const getAssigneeColor = (assigneeId: string) => {
    if (assigneeId === 'unassigned') return '#6B7280';
    const user = users.find(u => u.id === assigneeId);
    return user?.color || '#6B7280';
  };

  const getAziendaName = (aziendaId: string) => {
    const azienda = aziende.find(a => a.id === aziendaId);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Vista Calendario Servizi
          </DialogTitle>
        </DialogHeader>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Oggi
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <h3 className="text-lg font-semibold">
            {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
          </h3>
          
          <div className="text-sm text-muted-foreground">
            {dayServizi.length} servizi
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Object.keys(serviziByAssignee).length}, 1fr)` }}>
            {/* Headers */}
            {Object.keys(serviziByAssignee).map(assigneeId => (
              <Card key={assigneeId} className="min-h-[600px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getAssigneeColor(assigneeId) }}
                    />
                    {getAssigneeName(assigneeId)}
                    <Badge variant="outline" className="ml-auto">
                      {serviziByAssignee[assigneeId].length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
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
                        style={{ borderLeftColor: getAssigneeColor(assigneeId) }}
                        onClick={() => onNavigateToDetail(servizio.id)}
                      >
                        <div className="space-y-2">
                          {/* Service Time and Status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Clock className="h-3 w-3" />
                              {getServiceTime(servizio)}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getStatusColor(servizio.stato)}`}
                            >
                              {getStatusLabel(servizio.stato)}
                            </Badge>
                          </div>

                          {/* Company */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {getAziendaName(servizio.azienda_id)}
                          </div>

                          {/* Commessa */}
                          {servizio.numero_commessa && (
                            <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                              #{servizio.numero_commessa}
                            </div>
                          )}

                          {/* Pickup and Destination */}
                          <div className="space-y-1 text-xs">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 mt-0.5 text-green-600" />
                              <span className="truncate">{servizio.indirizzo_presa}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-3 w-3 mt-0.5 text-red-600" />
                              <span className="truncate">{servizio.indirizzo_destinazione}</span>
                            </div>
                          </div>

                          {/* Notes */}
                          {servizio.note && (
                            <div className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                              {servizio.note.slice(0, 50)}{servizio.note.length > 50 ? '...' : ''}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {dayServizi.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessun servizio per questa giornata</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}