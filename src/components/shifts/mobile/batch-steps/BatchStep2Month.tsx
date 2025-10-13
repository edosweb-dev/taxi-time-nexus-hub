import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type BatchShiftFormData } from '@/lib/schemas/shifts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';


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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarIcon className="w-5 h-5" />
        <h3 className="font-medium text-foreground">Seleziona Mese</h3>
      </div>

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

      <div className="text-sm text-muted-foreground text-center">
        Seleziona il mese per cui vuoi creare i turni
      </div>
    </div>
  );
}
