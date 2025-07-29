import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MousePointer, Clock, Calendar, User } from 'lucide-react';
import { ShiftType, HalfDayType } from '../types';
import { shiftTypeLabels } from './ShiftGridLegend';
import { Profile } from '@/lib/types';

interface QuickShiftToolbarProps {
  selectedShiftType: ShiftType | null;
  onShiftTypeChange: (type: ShiftType | null) => void;
  selectedEmployee: Profile | null;
  onEmployeeChange: (employee: Profile | null) => void;
  employees: Profile[];
  halfDayType: HalfDayType;
  onHalfDayTypeChange: (type: HalfDayType) => void;
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  onClearSelection: () => void;
}

export function QuickShiftToolbar({
  selectedShiftType,
  onShiftTypeChange,
  selectedEmployee,
  onEmployeeChange,
  employees,
  halfDayType,
  onHalfDayTypeChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onClearSelection
}: QuickShiftToolbarProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Inserimento Rapido Turni</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearSelection}
              className="text-xs"
            >
              Resetta
            </Button>
          </div>

          {/* Main Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Employee Selection */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <User className="h-3 w-3" />
                Dipendente
              </Label>
              <Select 
                value={selectedEmployee?.id || ''} 
                onValueChange={(value) => {
                  const emp = employees.find(e => e.id === value);
                  onEmployeeChange(emp || null);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tutti i dipendenti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutti i dipendenti</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shift Type Selection */}
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Tipo Turno
              </Label>
              <Select 
                value={selectedShiftType || ''} 
                onValueChange={(value) => onShiftTypeChange(value as ShiftType || null)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Seleziona turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nessuno</SelectItem>
                  {Object.entries(shiftTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Half Day Type (if applicable) */}
            {selectedShiftType === 'half_day' && (
              <div className="space-y-1">
                <Label className="text-xs">Tipologia</Label>
                <Select 
                  value={halfDayType} 
                  onValueChange={(value) => onHalfDayTypeChange(value as HalfDayType)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Mattino</SelectItem>
                    <SelectItem value="afternoon">Pomeriggio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Time Inputs (if applicable) */}
            {selectedShiftType === 'specific_hours' && (
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Orario
                </Label>
                <div className="flex gap-1">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => onEndTimeChange(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="flex items-center justify-between pt-2 border-t border-primary/10">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>• Click su giorno per inserire turno selezionato</span>
              <span>• Doppio click per editing avanzato</span>
            </div>
            
            {selectedShiftType && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Turno attivo:</span>
                <Badge variant="secondary" className="text-xs">
                  {shiftTypeLabels[selectedShiftType]}
                  {selectedShiftType === 'half_day' && ` (${halfDayType === 'morning' ? 'M' : 'P'})`}
                  {selectedShiftType === 'specific_hours' && startTime && endTime && ` (${startTime}-${endTime})`}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}