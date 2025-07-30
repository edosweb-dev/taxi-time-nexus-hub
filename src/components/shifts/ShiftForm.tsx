import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CreateShiftData, User } from '@/types/shifts';

const shiftFormSchema = z.object({
  user_id: z.string().min(1, 'Seleziona un utente'),
  shift_date: z.date({ required_error: 'Seleziona una data' }),
  shift_type: z.enum(['work', 'sick_leave', 'vacation', 'unavailable'], {
    required_error: 'Seleziona un tipo di turno'
  }),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional()
}).refine((data) => {
  if (data.shift_type === 'work') {
    return data.start_time && data.end_time;
  }
  return true;
}, {
  message: 'Per i turni di lavoro sono obbligatori orario di inizio e fine',
  path: ['start_time']
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftFormProps {
  onSubmit: (data: CreateShiftData) => Promise<void>;
  users: User[];
  defaultValues?: Partial<ShiftFormValues>;
  loading?: boolean;
}

const shiftTypeLabels = {
  work: 'Lavoro',
  sick_leave: 'Malattia',
  vacation: 'Ferie',
  unavailable: 'Non disponibile'
};

export function ShiftForm({ onSubmit, users, defaultValues, loading }: ShiftFormProps) {
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      shift_type: 'work',
      start_time: '09:00',
      end_time: '17:00',
      ...defaultValues
    }
  });

  const shiftType = form.watch('shift_type');

  const handleSubmit = async (data: ShiftFormValues) => {
    const shiftData: CreateShiftData = {
      user_id: data.user_id,
      shift_date: format(data.shift_date, 'yyyy-MM-dd'),
      shift_type: data.shift_type,
      start_time: data.start_time,
      end_time: data.end_time,
      notes: data.notes
    };

    await onSubmit(shiftData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="user_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un utente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shift_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
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
                        format(field.value, 'dd/MM/yyyy')
                      ) : (
                        <span>Seleziona una data</span>
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
          <>
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
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (opzionale)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Aggiungi note al turno..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creazione...' : 'Crea turno'}
        </Button>
      </form>
    </Form>
  );
}