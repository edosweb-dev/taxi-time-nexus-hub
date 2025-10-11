import React from 'react';
import { Calendar } from 'lucide-react';
import { type BatchShiftFormData } from '@/lib/schemas/shifts';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface BatchStep4WeekdaysProps {
  formData: Partial<BatchShiftFormData>;
  onChange: (data: Partial<BatchShiftFormData>) => void;
}

const WEEKDAYS = [
  { value: 1, label: 'Lunedì' },
  { value: 2, label: 'Martedì' },
  { value: 3, label: 'Mercoledì' },
  { value: 4, label: 'Giovedì' },
  { value: 5, label: 'Venerdì' },
  { value: 6, label: 'Sabato' },
  { value: 0, label: 'Domenica' },
];

export function BatchStep4Weekdays({ formData, onChange }: BatchStep4WeekdaysProps) {
  const selectedWeekdays = formData.weekdays || [];

  const handleToggleDay = (day: number, checked: boolean) => {
    const current = formData.weekdays || [];
    if (checked) {
      onChange({ weekdays: [...current, day].sort() });
    } else {
      onChange({ weekdays: current.filter(d => d !== day) });
    }
  };

  const handleQuickSelect = (preset: 'weekdays' | 'weekend' | 'all' | 'reset') => {
    switch (preset) {
      case 'weekdays':
        onChange({ weekdays: [1, 2, 3, 4, 5] }); // Lun-Ven
        break;
      case 'weekend':
        onChange({ weekdays: [6, 0] }); // Sab-Dom
        break;
      case 'all':
        onChange({ weekdays: [0, 1, 2, 3, 4, 5, 6] }); // Tutti
        break;
      case 'reset':
        onChange({ weekdays: [] }); // Nessuno
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-5 h-5" />
        <h3 className="font-medium text-foreground">Giorni della Settimana</h3>
      </div>

      <div className="text-sm text-muted-foreground">
        Seleziona i giorni da includere nei turni
      </div>

      {/* Lista giorni */}
      <div className="space-y-3">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedWeekdays.includes(day.value);
          
          return (
            <div
              key={day.value}
              className="flex items-center space-x-3 rounded-lg border p-4"
            >
              <Checkbox
                id={`day-${day.value}`}
                checked={isSelected}
                onCheckedChange={(checked) => 
                  handleToggleDay(day.value, checked as boolean)
                }
              />
              <Label
                htmlFor={`day-${day.value}`}
                className="flex-1 cursor-pointer font-medium"
              >
                {day.label}
              </Label>
            </div>
          );
        })}
      </div>

      {/* Counter */}
      <div className="text-sm text-muted-foreground text-center">
        {selectedWeekdays.length} {selectedWeekdays.length === 1 ? 'giorno selezionato' : 'giorni selezionati'}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Azioni Rapide:</div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect('weekdays')}
          >
            Lun-Ven
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect('weekend')}
          >
            Sab-Dom
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect('all')}
          >
            Tutti
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect('reset')}
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}