import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RefreshCw, Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ShiftFormData } from '../../types';

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

interface BatchStep4PreviewProps {
  shifts: ShiftFormData[];
  users: User[];
  onRegenerate: () => void;
}

const SHIFT_TYPE_LABELS = {
  'full_day': 'Giornata intera',
  'half_day': 'Mezza giornata',
  'specific_hours': 'Orario specifico',
  'sick_leave': 'Malattia',
  'unavailable': 'Non disponibile',
  'extra': 'Extra'
};

const HALF_DAY_LABELS = {
  'morning': 'Mattina',
  'afternoon': 'Pomeriggio'
};

export function BatchStep4Preview({ shifts, users, onRegenerate }: BatchStep4PreviewProps) {
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return userId;
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.id;
  };

  const getShiftTypeLabel = (shift: ShiftFormData) => {
    let label = SHIFT_TYPE_LABELS[shift.shift_type] || shift.shift_type;
    
    if (shift.shift_type === 'half_day' && shift.half_day_type) {
      label += ` (${HALF_DAY_LABELS[shift.half_day_type]})`;
    }
    
    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
      label += ` (${shift.start_time} - ${shift.end_time})`;
    }
    
    return label;
  };

  // Group shifts by date
  const shiftsByDate = shifts.reduce((acc, shift) => {
    const dateKey = format(shift.shift_date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(shift);
    return acc;
  }, {} as Record<string, ShiftFormData[]>);

  const sortedDates = Object.keys(shiftsByDate).sort();

  // Statistics
  const uniqueUsers = new Set(shifts.map(s => s.user_id)).size;
  const uniqueDates = sortedDates.length;

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Riepilogo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{shifts.length}</div>
              <div className="text-xs text-muted-foreground">Turni totali</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{uniqueUsers}</div>
              <div className="text-xs text-muted-foreground">Dipendenti</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{uniqueDates}</div>
              <div className="text-xs text-muted-foreground">Giorni</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Anteprima turni</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              className="h-8"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Rigenera
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {shifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p>Nessun turno generato</p>
              <p className="text-xs">Controlla le impostazioni precedenti</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {sortedDates.map((dateKey) => {
                const dateShifts = shiftsByDate[dateKey];
                const date = new Date(dateKey);
                
                return (
                  <div key={dateKey} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground border-b pb-1">
                      <Calendar className="w-3 h-3" />
                      {format(date, 'EEEE d MMMM yyyy', { locale: it })}
                      <Badge variant="secondary" className="text-xs">
                        {dateShifts.length} turni
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 pl-4">
                      {dateShifts.map((shift, index) => (
                        <div
                          key={`${shift.user_id}-${dateKey}-${index}`}
                          className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">
                              {getUserName(shift.user_id)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs">
                              {getShiftTypeLabel(shift)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {shifts.length > 10 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                Creazione di {shifts.length} turni potrebbe richiedere alcuni minuti
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}