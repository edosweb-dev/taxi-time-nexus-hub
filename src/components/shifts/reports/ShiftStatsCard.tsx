
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, Calendar, User, TrendingUp, Briefcase, HeartHandshake } from 'lucide-react';
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
  const initials = `${stats.user_first_name?.charAt(0) || ''}${stats.user_last_name?.charAt(0) || ''}`.toUpperCase() || 'U';
  
  // Performance indicator
  const getPerformanceColor = () => {
    if (stats.total_hours >= 160) return 'text-green-600';
    if (stats.total_hours >= 120) return 'text-blue-600';
    if (stats.total_hours >= 80) return 'text-amber-600';
    return 'text-gray-600';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isSelected 
          ? 'ring-2 ring-primary border-primary shadow-md bg-primary/5' 
          : 'hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarFallback className={`${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'} font-semibold`}>
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm leading-tight truncate">
                {displayName}
              </h3>
              {isSelected && (
                <Badge variant="default" className="ml-2 text-xs">
                  Selezionato
                </Badge>
              )}
            </div>
            {stats.user_email && (
              <p className="text-xs text-muted-foreground truncate mt-1">
                {stats.user_email}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {/* Statistiche principali */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className={`flex items-center justify-center gap-1 text-lg font-bold ${getPerformanceColor()}`}>
              <Clock className="h-4 w-4" />
              {stats.total_hours}
            </div>
            <p className="text-xs text-muted-foreground">Ore totali</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-emerald-600">
              <Briefcase className="h-4 w-4" />
              {stats.working_days}
            </div>
            <p className="text-xs text-muted-foreground">Giorni</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-600">
              <TrendingUp className="h-4 w-4" />
              {stats.average_hours_per_day.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">h/giorno</p>
          </div>
        </div>

        {/* Tipologie turni - compatto */}
        <div className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded-lg">
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Intere: {stats.full_days}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Mezze: {stats.half_days}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              Ore: {stats.specific_hours_shifts}
            </span>
          </div>
        </div>

        {/* Assenze - solo se presenti */}
        {(stats.sick_days > 0 || stats.unavailable_days > 0) && (
          <div className="flex justify-between items-center pt-2 border-t border-dashed text-xs">
            {stats.sick_days > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <HeartHandshake className="h-3 w-3" />
                <span>Malattia: {stats.sick_days}</span>
              </div>
            )}
            {stats.unavailable_days > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Calendar className="h-3 w-3" />
                <span>N.D.: {stats.unavailable_days}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
