
import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Calendar, FileText, TrendingUp, User, MousePointer } from 'lucide-react';
import { Shift } from '../types';
import { UserShiftStats } from './shiftReportsApi';
import { getUserDisplayName } from '../utils/userDisplayUtils';
import { getShiftTypeDisplay, getShiftTypeColor } from '../utils/shiftDisplayUtils';

interface UserShiftDetailReportProps {
  userStats: UserShiftStats | null;
  userShifts: Shift[];
  period: { start_date: string; end_date: string };
  isLoading?: boolean;
  onDayClick?: (date: Date) => void;
}

export function UserShiftDetailReport({ 
  userStats, 
  userShifts, 
  period, 
  isLoading = false,
  onDayClick
}: UserShiftDetailReportProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            Caricamento dettagli utente...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userStats) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-muted-foreground">
            Seleziona un utente per visualizzare il report dettagliato
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = getUserDisplayName({
    user_first_name: userStats.user_first_name,
    user_last_name: userStats.user_last_name,
    user_email: userStats.user_email,
  } as any);

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return time.substring(0, 5); // HH:MM
  };

  const getShiftDuration = (shift: Shift): string => {
    if (shift.shift_type === 'full_day') {
      return '8h';
    } else if (shift.shift_type === 'half_day') {
      return '4h';
    }
    return '-';
  };

  return (
    <div className="space-y-6">
      {/* Header con info utente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Report Dettagliato: {displayName}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Periodo: {format(new Date(period.start_date), 'dd MMMM yyyy', { locale: it })} - {format(new Date(period.end_date), 'dd MMMM yyyy', { locale: it })}
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Statistiche riassuntive */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-primary">
                <Clock className="h-5 w-5" />
                {userStats.total_hours}h
              </div>
              <p className="text-sm text-muted-foreground">Ore totali</p>
            </div>
            
            <div className="text-center p-4 bg-green-100 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-green-600">
                <Calendar className="h-5 w-5" />
                {userStats.working_days}
              </div>
              <p className="text-sm text-muted-foreground">Giorni lavorativi</p>
            </div>
            
            <div className="text-center p-4 bg-blue-100 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-blue-600">
                <TrendingUp className="h-5 w-5" />
                {userStats.average_hours_per_day}h
              </div>
              <p className="text-sm text-muted-foreground">Media/giorno</p>
            </div>
            
            <div className="text-center p-4 bg-orange-100 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-xl font-bold text-orange-600">
                <FileText className="h-5 w-5" />
                {userShifts.length}
              </div>
              <p className="text-sm text-muted-foreground">Turni totali</p>
            </div>
          </div>

          {/* Distribuzione turni */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Distribuzione Turni</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Giornate intere:</span>
                  <Badge variant="secondary">{userStats.full_days}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Mezze giornate:</span>
                  <Badge variant="secondary">{userStats.half_days}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ore specifiche:</span>
                  <Badge variant="secondary">{userStats.specific_hours_shifts}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Assenze</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Giorni malattia:</span>
                  <Badge variant={userStats.sick_days > 0 ? "destructive" : "secondary"}>
                    {userStats.sick_days}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Non disponibile:</span>
                  <Badge variant={userStats.unavailable_days > 0 ? "outline" : "secondary"}>
                    {userStats.unavailable_days}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabella dettagliata dei turni */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dettaglio Turni</CardTitle>
            {onDayClick && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MousePointer className="h-4 w-4" />
                Clicca su una data per vedere i servizi
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {userShifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun turno trovato per il periodo selezionato
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo Turno</TableHead>
                    <TableHead>Orario</TableHead>
                    <TableHead>Durata</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userShifts.map((shift) => (
                    <TableRow key={shift.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {onDayClick ? (
                          <button
                            onClick={() => onDayClick(new Date(shift.shift_date))}
                            className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
                          >
                            {format(new Date(shift.shift_date), 'dd/MM/yyyy')}
                          </button>
                        ) : (
                          <span>{format(new Date(shift.shift_date), 'dd/MM/yyyy')}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getShiftTypeColor(shift.shift_type)}
                        >
                          {getShiftTypeDisplay(shift)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        -
                      </TableCell>
                      <TableCell>
                        {getShiftDuration(shift)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {shift.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
