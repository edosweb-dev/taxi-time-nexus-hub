
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, TrendingUp } from 'lucide-react';
import { UserShiftStats } from './shiftReportsApi';
import { getUserDisplayName } from '../utils/userDisplayUtils';

interface ShiftStatsCardProps {
  stats: UserShiftStats;
  onClick: () => void;
  isSelected?: boolean;
}

export function ShiftStatsCard({ stats, onClick, isSelected = false }: ShiftStatsCardProps) {
  const displayName = getUserDisplayName({
    user_first_name: stats.user_first_name,
    user_last_name: stats.user_last_name,
    user_email: stats.user_email,
  } as any);

  const totalDays = stats.working_days + stats.sick_days + stats.unavailable_days;

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-4 w-4" />
            {displayName}
          </CardTitle>
          {totalDays > 0 && (
            <Badge variant={stats.working_days > 0 ? "default" : "secondary"}>
              {totalDays} giorni
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiche principali */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
              <Clock className="h-5 w-5" />
              {stats.total_hours}h
            </div>
            <p className="text-sm text-muted-foreground">Ore totali</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-green-600">
              <Calendar className="h-5 w-5" />
              {stats.working_days}
            </div>
            <p className="text-sm text-muted-foreground">Giorni lavorativi</p>
          </div>
        </div>

        {/* Media ore per giorno */}
        {stats.average_hours_per_day > 0 && (
          <div className="text-center p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-lg font-semibold">
              <TrendingUp className="h-4 w-4" />
              {stats.average_hours_per_day}h/giorno
            </div>
            <p className="text-xs text-muted-foreground">Media ore per giorno</p>
          </div>
        )}

        {/* Dettagli turni */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Giornate intere:</span>
            <Badge variant="secondary">{stats.full_days}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Mezze giornate:</span>
            <Badge variant="secondary">{stats.half_days}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Ore specifiche:</span>
            <Badge variant="secondary">{stats.specific_hours_shifts}</Badge>
          </div>
        </div>

        {/* Assenze */}
        {(stats.sick_days > 0 || stats.unavailable_days > 0) && (
          <div className="space-y-2 pt-2 border-t">
            {stats.sick_days > 0 && (
              <div className="flex justify-between text-sm">
                <span>Giorni malattia:</span>
                <Badge variant="destructive">{stats.sick_days}</Badge>
              </div>
            )}
            {stats.unavailable_days > 0 && (
              <div className="flex justify-between text-sm">
                <span>Non disponibile:</span>
                <Badge variant="outline">{stats.unavailable_days}</Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
