import React from 'react';
import { CheckCircle2, Loader2, Users, Calendar, Clock } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { type BatchShiftFormData } from '@/lib/schemas/shifts';
import { SHIFT_TYPE_LABELS, SHIFT_TYPE_DESCRIPTIONS, HALF_DAY_TYPE_LABELS } from '@/components/shifts/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BatchStep5TypeConfirmProps {
  formData: Partial<BatchShiftFormData>;
  onChange: (data: Partial<BatchShiftFormData>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Gio',
  5: 'Ven',
  6: 'Sab'
};

export function BatchStep5TypeConfirm({
  formData,
  onChange,
  onSubmit,
  isSubmitting
}: BatchStep5TypeConfirmProps) {
  const { users } = useUsers();
  const shiftType = formData.shift_type || 'full_day';

  const estimateShiftsCount = (): number => {
    const userCount = formData.user_ids?.length || 0;
    const weekdayCount = formData.weekdays?.length || 0;
    
    let weeksCount = 0;
    if (formData.period_type === 'full_month') {
      weeksCount = 4;
    } else if (formData.period_type === 'single_week') {
      weeksCount = 1;
    } else if (formData.period_type === 'multiple_weeks') {
      weeksCount = formData.weeks?.length || 0;
    }

    return userCount * weekdayCount * weeksCount;
  };

  const selectedUsers = users?.filter(u => formData.user_ids?.includes(u.id)) || [];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-5 h-5" />
          <h3 className="font-medium text-foreground">Tipo Turno</h3>
        </div>

        <RadioGroup
          value={shiftType}
          onValueChange={(value) => onChange({ shift_type: value as any })}
        >
          {(['full_day', 'half_day', 'extra', 'unavailable'] as const).map((type) => (
            <div key={type} className="flex items-start space-x-3 rounded-lg border p-4">
              <RadioGroupItem value={type} id={type} className="mt-1" />
              <Label htmlFor={type} className="flex-1 cursor-pointer">
                <div className="font-medium">{SHIFT_TYPE_LABELS[type]}</div>
                <div className="text-sm text-muted-foreground">
                  {SHIFT_TYPE_DESCRIPTIONS[type]}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {shiftType === 'half_day' && (
          <div className="pl-6">
            <Label className="mb-2 block">Quando? *</Label>
            <Select
              value={formData.half_day_type}
              onValueChange={(value) => onChange({ half_day_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Mattina o Pomeriggio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">
                  {HALF_DAY_TYPE_LABELS.morning} (00:00 - 13:00)
                </SelectItem>
                <SelectItem value="afternoon">
                  {HALF_DAY_TYPE_LABELS.afternoon} (13:00 - 23:59)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="w-5 h-5" />
          <h3 className="font-medium text-foreground">Riepilogo</h3>
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Dipendenti:</div>
              <div className="text-sm text-muted-foreground">
                {selectedUsers.length} {selectedUsers.length === 1 ? 'selezionato' : 'selezionati'}
                {selectedUsers.length <= 3 && (
                  <span className="block">
                    {selectedUsers.map(u => `${u.first_name} ${u.last_name}`).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Periodo:</div>
              <div className="text-sm text-muted-foreground">
                {MONTHS[(formData.month || 1) - 1]} {formData.year}
                {formData.period_type === 'single_week' && ` - Settimana ${formData.week}`}
                {formData.period_type === 'multiple_weeks' && 
                  ` - Settimane ${formData.weeks?.join(', ')}`}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Giorni:</div>
              <div className="text-sm text-muted-foreground">
                {formData.weekdays?.map(d => WEEKDAY_LABELS[d]).join(', ')}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Tipo:</div>
              <div className="text-sm text-muted-foreground">
                {SHIFT_TYPE_LABELS[shiftType]}
                {shiftType === 'half_day' && formData.half_day_type && 
                  ` - ${HALF_DAY_TYPE_LABELS[formData.half_day_type]}`}
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <div className="text-sm text-muted-foreground">Verranno creati circa</div>
          <div className="text-2xl font-bold text-primary">
            ~{estimateShiftsCount()} turni
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Note (opzionale)</Label>
        <Textarea
          placeholder="Aggiungi note per questi turni..."
          value={formData.notes || ''}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="resize-none"
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
          onClick={() => {}}
        >
          Annulla
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creazione...
            </>
          ) : (
            'Crea Turni'
          )}
        </Button>
      </div>
    </div>
  );
}
