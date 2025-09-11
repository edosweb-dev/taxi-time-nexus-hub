import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ShiftFormValues } from '../../dialogs/ShiftFormSchema';

interface Step1UserAndDateProps {
  control: Control<ShiftFormValues>;
  users: Array<{ id: string; first_name: string | null; last_name: string | null; }>;
  isAdminOrSocio: boolean;
}

export function Step1UserAndDate({ control, users, isAdminOrSocio }: Step1UserAndDateProps) {
  return (
    <div className="step-fields">
      {isAdminOrSocio && (
        <div className="field-group">
          <label className="field-label">Assegna a *</label>
          <Controller
            name="user_id"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mobile-select">
                  <SelectValue placeholder="Seleziona utente" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <div className="field-group">
        <label className="field-label">Data *</label>
        <Controller
          name="shift_date"
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
                  {field.value ? format(field.value, "PPP", { locale: it }) : "Seleziona data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
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