import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ShiftFormValues } from '../../dialogs/ShiftFormSchema';

interface Step3TimesProps {
  control: Control<ShiftFormValues>;
  watchShiftType: string;
}

export function Step3Times({ control, watchShiftType }: Step3TimesProps) {
  // For specific hours, show time inputs
  if (watchShiftType === 'specific_hours') {
    return (
      <div className="step-fields">
        <div className="time-inputs">
          <div className="field-group">
            <label className="field-label">Ora Inizio *</label>
            <Controller
              name="start_time"
              control={control}
              render={({ field }) => (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="time"
                    {...field}
                    value={field.value || ''}
                    className="mobile-time-input"
                  />
                </div>
              )}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Ora Fine *</label>
            <Controller
              name="end_time"
              control={control}
              render={({ field }) => (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="time"
                    {...field}
                    value={field.value || ''}
                    className="mobile-time-input"
                  />
                </div>
              )}
            />
          </div>
        </div>
      </div>
    );
  }

  // For sick leave and unavailable, show date range
  if (watchShiftType === 'sick_leave' || watchShiftType === 'unavailable') {
    const shiftTypeLabel = watchShiftType === 'sick_leave' ? 'malattia' : 'indisponibilità';
    
    return (
      <div className="step-fields">
        <div className="info-message">
          <p>Specifica il periodo di {shiftTypeLabel}. Se non specifichi una data di fine, verrà considerato solo il giorno selezionato.</p>
        </div>

        <div className="field-group">
          <label className="field-label">Data Inizio *</label>
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mobile-date-picker justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP", { locale: it }) : "Seleziona data inizio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    className={cn("p-3 pointer-events-auto")}
                    locale={it}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Data Fine (opzionale)</label>
          <Controller
            name="end_date"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mobile-date-picker justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP", { locale: it }) : "Seleziona data fine"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    className={cn("p-3 pointer-events-auto")}
                    locale={it}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>
      </div>
    );
  }

  // For other shift types, show info message
  return (
    <div className="step-fields">
      <div className="info-message">
        <p>
          {watchShiftType === 'full_day' && 'Gli orari per giornata intera sono predefiniti dal sistema.'}
          {watchShiftType === 'half_day' && 'Gli orari per mezza giornata sono predefiniti dal sistema.'}
          {watchShiftType === 'extra' && 'Turno straordinario con orari da definire.'}
        </p>
      </div>
    </div>
  );
}