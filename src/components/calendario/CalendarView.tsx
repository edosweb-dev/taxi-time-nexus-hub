import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, User, Building2 } from 'lucide-react';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
  servizi: any[];
  aziende: any[];
  users: any[];
  currentDate: Date;
  viewMode: ViewMode;
  onNavigateToDetail: (id: string) => void;
  onDateSelect: (date: Date) => void;
}

interface CalendarServiceCardProps {
  servizio: any;
  timeSlot?: string;
  onTap: () => void;
  aziendaName?: string;
  conducente?: any;
}

function CalendarServiceCard({ servizio, timeSlot, onTap, aziendaName, conducente }: CalendarServiceCardProps) {
  const getStatusColor = (stato: string) => {
    switch (stato) {
      case 'da_assegnare': return 'border-l-yellow-500 bg-yellow-50';
      case 'assegnato': return 'border-l-blue-500 bg-blue-50';
      case 'completato': return 'border-l-green-500 bg-green-50';
      case 'annullato': return 'border-l-red-500 bg-red-50';
      case 'consuntivato': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getStatusLabel = (stato: string) => {
    switch (stato) {
      case 'da_assegnare': return 'Da Assegnare';
      case 'assegnato': return 'Assegnato';
      case 'completato': return 'Completato';
      case 'annullato': return 'Annullato';
      case 'consuntivato': return 'Consuntivato';
      default: return stato;
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${getStatusColor(servizio.stato)} min-h-[44px]`}
      onClick={onTap}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {timeSlot || servizio.orario_servizio}
          </span>
          <Badge variant="outline" className="text-xs">
            {getStatusLabel(servizio.stato)}
          </Badge>
        </div>
        
        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
          {aziendaName || 'Cliente'}
        </h4>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
            <span className="truncate">{servizio.indirizzo_presa}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            <span className="truncate">{servizio.indirizzo_destinazione}</span>
          </div>
        </div>
        
        {conducente && (
          <div className="mt-2 flex items-center text-xs text-blue-600">
            <User className="w-3 h-3 mr-1" />
            {conducente.first_name} {conducente.last_name}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CalendarView({ 
  servizi, 
  aziende, 
  users, 
  currentDate, 
  viewMode, 
  onNavigateToDetail, 
  onDateSelect 
}: CalendarViewProps) {
  
  // Get days to show based on view mode
  const daysToShow = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return [currentDate];
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { locale: it }),
          end: endOfWeek(currentDate, { locale: it })
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        });
      default:
        return [currentDate];
    }
  }, [currentDate, viewMode]);

  // Filter services for the displayed period
  const serviziInPeriod = useMemo(() => {
    const startDate = daysToShow[0];
    const endDate = daysToShow[daysToShow.length - 1];
    
    return servizi.filter(servizio => {
      const serviceDate = new Date(servizio.data_servizio);
      return serviceDate >= startDate && serviceDate <= endDate;
    });
  }, [servizi, daysToShow]);

  // Get azienda name by ID
  const getAziendaName = (aziendaId: string) => {
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda?.nome || 'Azienda sconosciuta';
  };

  // Get user by ID
  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  // Get services for a specific day
  const getServicesForDay = (day: Date) => {
    return serviziInPeriod.filter(servizio => 
      isSameDay(new Date(servizio.data_servizio), day)
    ).sort((a, b) => {
      const timeA = a.orario_servizio || '12:00';
      const timeB = b.orario_servizio || '12:00';
      return timeA.localeCompare(timeB);
    });
  };

  // Render month view
  if (viewMode === 'month') {
    // Organize days in weeks for month view
    const weeks = [];
    for (let i = 0; i < daysToShow.length; i += 7) {
      weeks.push(daysToShow.slice(i, i + 7));
    }

    return (
      <div className="bg-white rounded-lg border">
        {/* Month header */}
        <div className="grid grid-cols-7 border-b">
          {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day, index) => (
            <div key={index} className="p-3 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Month grid */}
        <div className="grid grid-rows-6">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((day, dayIndex) => {
                const dayServices = getServicesForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isCurrentDay = isToday(day);
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`
                      min-h-[120px] border-r border-b p-2 cursor-pointer hover:bg-gray-50
                      ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                      ${isCurrentDay ? 'bg-blue-50' : ''}
                    `}
                    onClick={() => onDateSelect(day)}
                  >
                    <div className={`
                      text-sm mb-2 font-medium
                      ${isCurrentDay ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    `}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Service dots */}
                    <div className="space-y-1">
                      {dayServices.slice(0, 3).map((servizio, index) => (
                        <div key={index} className="text-xs p-1 bg-primary text-primary-foreground rounded truncate">
                          {servizio.orario_servizio} - {getAziendaName(servizio.azienda_id).substring(0, 10)}
                        </div>
                      ))}
                      {dayServices.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayServices.length - 3} altri
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render week view
  if (viewMode === 'week') {
    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Week header */}
        <div className="grid grid-cols-7 border-b">
          {daysToShow.map((day, index) => {
            const isCurrentDay = isToday(day);
            const dayServices = getServicesForDay(day);
            
            return (
              <div 
                key={index} 
                className={`
                  p-3 text-center border-r cursor-pointer hover:bg-gray-50
                  ${isCurrentDay ? 'bg-blue-50' : ''}
                `}
                onClick={() => onDateSelect(day)}
              >
                <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'EEE', { locale: it })}
                </div>
                <div className={`text-lg font-bold ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {dayServices.length} servizi
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Week content */}
        <div className="grid grid-cols-7" style={{ minHeight: '400px' }}>
          {daysToShow.map((day, index) => {
            const dayServices = getServicesForDay(day);
            
            return (
              <div key={index} className="border-r p-3 space-y-2">
                {dayServices.map((servizio) => (
                  <CalendarServiceCard
                    key={servizio.id}
                    servizio={servizio}
                    timeSlot={servizio.orario_servizio}
                    onTap={() => onNavigateToDetail(servizio.id)}
                    aziendaName={getAziendaName(servizio.azienda_id)}
                    conducente={getUserById(servizio.assegnato_a)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render day view
  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="text-center p-4 bg-white rounded-lg border">
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentDate, 'EEEE d MMMM yyyy', { locale: it })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {getServicesForDay(currentDate).length} servizi programmati
        </p>
      </div>

      {/* Day services */}
      <div className="space-y-3">
        {getServicesForDay(currentDate).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nessun servizio per oggi
              </h3>
              <p className="text-sm text-muted-foreground">
                Seleziona una data diversa o aggiungi nuovi servizi
              </p>
            </CardContent>
          </Card>
        ) : (
          getServicesForDay(currentDate).map((servizio) => (
            <CalendarServiceCard
              key={servizio.id}
              servizio={servizio}
              timeSlot={servizio.orario_servizio}
              onTap={() => onNavigateToDetail(servizio.id)}
              aziendaName={getAziendaName(servizio.azienda_id)}
              conducente={getUserById(servizio.assegnato_a)}
            />
          ))
        )}
      </div>
    </div>
  );
}