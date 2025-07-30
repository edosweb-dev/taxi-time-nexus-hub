import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateShiftData, User } from '@/types/shifts';

const batchShiftFormSchema = z.object({
  user_ids: z.array(z.string()).min(1, 'Seleziona almeno un utente'),
  target_month: z.date({ required_error: 'Seleziona un mese' }),
  weekdays: z.array(z.number()).min(1, 'Seleziona almeno un giorno'),
  shift_type: z.enum(['work', 'sick_leave', 'vacation', 'unavailable']),
  start_time: z.string().optional(),
  end_time: z.string().optional()
});

type BatchShiftFormValues = z.infer<typeof batchShiftFormSchema>;

interface BatchShiftFormProps {
  onSubmit: (data: CreateShiftData[]) => Promise<void>;
  users: User[];
  loading?: boolean;
}

const weekdayLabels = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

const shiftTypeLabels = {
  work: 'Lavoro',
  sick_leave: 'Malattia',
  vacation: 'Ferie',
  unavailable: 'Non disponibile'
};

export function BatchShiftForm({ onSubmit, users, loading }: BatchShiftFormProps) {
  const [preview, setPreview] = useState<CreateShiftData[]>([]);

  const form = useForm<BatchShiftFormValues>({
    resolver: zodResolver(batchShiftFormSchema),
    defaultValues: {
      user_ids: [],
      weekdays: [],
      shift_type: 'work',
      start_time: '09:00',
      end_time: '17:00'
    }
  });

  const shiftType = form.watch('shift_type');
  const userIds = form.watch('user_ids');
  const targetMonth = form.watch('target_month');
  const weekdays = form.watch('weekdays');

  const generatePreview = () => {
    const formData = form.getValues();
    if (!formData.target_month || !formData.user_ids.length || !formData.weekdays.length) {
      setPreview([]);
      return;
    }

    const monthStart = startOfMonth(formData.target_month);
    const monthEnd = endOfMonth(formData.target_month);
    const allDates = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const filteredDates = allDates.filter(date => {
      const dayOfWeek = getDay(date);
      // Convert Sunday (0) to 6, and Monday (1) to 0, etc.
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      return formData.weekdays.includes(adjustedDay);
    });

    const shifts: CreateShiftData[] = [];
    formData.user_ids.forEach(userId => {
      filteredDates.forEach(date => {
        shifts.push({
          user_id: userId,
          shift_date: format(date, 'yyyy-MM-dd'),
          shift_type: formData.shift_type,
          start_time: formData.start_time,
          end_time: formData.end_time
        });
      });
    });

    setPreview(shifts);
  };

  const handleSubmit = async (data: BatchShiftFormValues) => {
    await onSubmit(preview);
    form.reset();
    setPreview([]);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="user_ids"
            render={() => (
              <FormItem>
                <FormLabel>Utenti</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {users.map((user) => (
                    <FormField
                      key={user.id}
                      control={form.control}
                      name="user_ids"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={user.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, user.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== user.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {user.first_name} {user.last_name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_month"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Mese</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'MMMM yyyy', { locale: it })
                        ) : (
                          <span>Seleziona un mese</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weekdays"
            render={() => (
              <FormItem>
                <FormLabel>Giorni della settimana</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {weekdayLabels.map((label, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name="weekdays"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={index}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(index)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, index])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== index
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shift_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo di turno</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(shiftTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {shiftType === 'work' && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orario inizio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orario fine</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={generatePreview}
              disabled={!userIds.length || !targetMonth || !weekdays.length}
            >
              Anteprima
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !preview.length}
            >
              {loading ? 'Creazione...' : `Crea ${preview.length} turni`}
            </Button>
          </div>
        </form>
      </Form>

      {preview.length > 0 && (
        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Anteprima turni ({preview.length})</h3>
          <div className="max-h-48 overflow-y-auto text-sm space-y-1">
            {preview.slice(0, 10).map((shift, index) => {
              const user = users.find(u => u.id === shift.user_id);
              return (
                <div key={index} className="flex justify-between">
                  <span>{user?.first_name} {user?.last_name}</span>
                  <span>{format(new Date(shift.shift_date), 'dd/MM/yyyy', { locale: it })}</span>
                  <span>{shiftTypeLabels[shift.shift_type]}</span>
                  {shift.start_time && shift.end_time && (
                    <span>{shift.start_time} - {shift.end_time}</span>
                  )}
                </div>
              );
            })}
            {preview.length > 10 && (
              <div className="text-center text-muted-foreground">
                ... e altri {preview.length - 10} turni
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}