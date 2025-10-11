import React from 'react';
import { Calendar } from 'lucide-react';
import { type BatchShiftFormData } from '@/lib/schemas/shifts';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface BatchStep3PeriodProps {
  formData: Partial<BatchShiftFormData>;
  onChange: (data: Partial<BatchShiftFormData>) => void;
}

export function BatchStep3Period({ formData, onChange }: BatchStep3PeriodProps) {
  const periodType = formData.period_type || 'full_month';
  const selectedWeek = formData.week;
  const selectedWeeks = formData.weeks || [];

  const handlePeriodTypeChange = (value: string) => {
    onChange({ 
      period_type: value as 'full_month' | 'single_week' | 'multiple_weeks',
      week: undefined,
      weeks: []
    });
  };

  const handleWeekToggle = (weekNum: number, checked: boolean) => {
    const current = formData.weeks || [];
    if (checked) {
      onChange({ weeks: [...current, weekNum].sort() });
    } else {
      onChange({ weeks: current.filter(w => w !== weekNum) });
    }
  };

  // Calcola settimane del mese
  const getWeeksInMonth = () => {
    const month = formData.month || new Date().getMonth() + 1;
    const year = formData.year || new Date().getFullYear();
    const lastDay = new Date(year, month, 0).getDate();
    const weeksCount = Math.ceil(lastDay / 7);
    
    return Array.from({ length: weeksCount }, (_, i) => {
      const weekNum = i + 1;
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = Math.min(weekNum * 7, lastDay);
      return { weekNum, startDay, endDay };
    });
  };

  const weeks = getWeeksInMonth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="w-5 h-5" />
        <h3 className="font-medium text-foreground">Seleziona Periodo</h3>
      </div>

      <RadioGroup value={periodType} onValueChange={handlePeriodTypeChange}>
        {/* Tutto il mese */}
        <div className="flex items-start space-x-3 rounded-lg border p-4">
          <RadioGroupItem value="full_month" id="full_month" className="mt-1" />
          <Label htmlFor="full_month" className="flex-1 cursor-pointer">
            <div className="font-medium">Tutto il mese</div>
            <div className="text-sm text-muted-foreground">
              Tutti i giorni del mese selezionato
            </div>
          </Label>
        </div>

        {/* Settimana singola */}
        <div className="flex items-start space-x-3 rounded-lg border p-4">
          <RadioGroupItem value="single_week" id="single_week" className="mt-1" />
          <div className="flex-1 space-y-3">
            <Label htmlFor="single_week" className="cursor-pointer">
              <div className="font-medium">Settimana Singola</div>
              <div className="text-sm text-muted-foreground">
                Una specifica settimana del mese
              </div>
            </Label>
            
            {periodType === 'single_week' && (
              <Select
                value={selectedWeek?.toString()}
                onValueChange={(value) => onChange({ week: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona settimana" />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((w) => (
                    <SelectItem key={w.weekNum} value={w.weekNum.toString()}>
                      Settimana {w.weekNum} ({w.startDay}-{w.endDay})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Settimane multiple */}
        <div className="flex items-start space-x-3 rounded-lg border p-4">
          <RadioGroupItem value="multiple_weeks" id="multiple_weeks" className="mt-1" />
          <div className="flex-1 space-y-3">
            <Label htmlFor="multiple_weeks" className="cursor-pointer">
              <div className="font-medium">Settimane Multiple</div>
              <div className="text-sm text-muted-foreground">
                Scegli più settimane specifiche
              </div>
            </Label>
            
            {periodType === 'multiple_weeks' && (
              <div className="space-y-2 pl-4 border-l-2">
                {weeks.map((w) => (
                  <div key={w.weekNum} className="flex items-center space-x-2">
                    <Checkbox
                      id={`week-${w.weekNum}`}
                      checked={selectedWeeks.includes(w.weekNum)}
                      onCheckedChange={(checked) => 
                        handleWeekToggle(w.weekNum, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`week-${w.weekNum}`}
                      className="cursor-pointer text-sm"
                    >
                      Settimana {w.weekNum} ({w.startDay}-{w.endDay})
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </RadioGroup>

      {/* Info */}
      {periodType === 'multiple_weeks' && selectedWeeks.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          {selectedWeeks.length} {selectedWeeks.length === 1 ? 'settimana selezionata' : 'settimane selezionate'}
        </div>
      )}
    </div>
  );
}
