import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { type BatchShiftFormData } from '@/lib/schemas/shifts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface BatchStep2MonthProps {
  formData: Partial<BatchShiftFormData>;
  onChange: (data: Partial<BatchShiftFormData>) => void;
}

const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export function BatchStep2Month({ formData, onChange }: BatchStep2MonthProps) {
  const month = formData.month || new Date().getMonth() + 1;
  const year = formData.year || new Date().getFullYear();

  // Genera mini calendario per preview
  const previewDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(previewDate);
  const monthEnd = endOfMonth(previewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Padding per allineare al giorno della settimana
  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array(startDayOfWeek === 0 ? 6 : startDayOfWeek - 1).fill(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarIcon className="w-5 h-5" />
        <h3 className="font-medium text-foreground">Seleziona Mese</h3>
      </div>

      {/* Selettori Mese/Anno */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mese</Label>
          <Select
            value={month.toString()}
            onValueChange={(value) => onChange({ month: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((monthName, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>
                  {monthName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Anno</Label>
          <Select
            value={year.toString()}
            onValueChange={(value) => onChange({ year: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar Preview */}
      <Card className="p-4">
        <div className="text-center font-semibold mb-3">
          {format(previewDate, 'MMMM yyyy', { locale: it })}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Header giorni settimana */}
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground p-1">
              {day}
            </div>
          ))}
          
          {/* Padding iniziale */}
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="p-1" />
          ))}
          
          {/* Giorni del mese */}
          {daysInMonth.map((day) => {
            const dayNum = day.getDate();
            const isWeekend = getDay(day) === 0 || getDay(day) === 6;
            
            return (
              <div
                key={dayNum}
                className={`
                  text-center text-sm p-1 rounded
                  ${isWeekend ? 'text-muted-foreground' : ''}
                `}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Info */}
      <div className="text-sm text-muted-foreground text-center">
        Seleziona il mese per cui vuoi creare i turni
      </div>
    </div>
  );
}
