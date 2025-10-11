import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useShifts } from '@/components/shifts/ShiftContext';
import { useUsers } from '@/hooks/useUsers';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const shiftCreateSchema = z.object({
  user_id: z.string().min(1, 'Seleziona un dipendente'),
  shift_type: z.enum(['full_day', 'half_day', 'extra', 'unavailable']),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  half_day_type: z.enum(['morning', 'afternoon']).optional(),
  notes: z.string().optional(),
});

type ShiftCreateFormValues = z.infer<typeof shiftCreateSchema>;

interface ShiftCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  isAdminOrSocio: boolean;
}

const shiftTypeLabels = {
  full_day: 'Giornata intera',
  half_day: 'Mezza giornata',
  extra: 'Extra',
  unavailable: 'Non disponibile'
};

export function ShiftCreateDialog({
  open,
  onOpenChange,
  selectedDate,
  isAdminOrSocio
}: ShiftCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createShift } = useShifts();
  const { users } = useUsers({ includeRoles: ['admin', 'socio', 'dipendente'] });

  const form = useForm<ShiftCreateFormValues>({
    resolver: zodResolver(shiftCreateSchema),
    defaultValues: {
      shift_type: 'full_day',
    },
  });

  const watchShiftType = form.watch('shift_type');

  const onSubmit = async (data: ShiftCreateFormValues) => {
    if (!selectedDate) return;

    setIsSubmitting(true);
    try {
      await createShift({
        user_id: data.user_id!,
        shift_type: data.shift_type!,
        shift_date: selectedDate,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        half_day_type: data.half_day_type || null,
        notes: data.notes || null,
        start_date: null,
        end_date: null,
      });
      
      toast.success('Turno creato con successo');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error creating shift:', error);
      toast.error('Errore nella creazione del turno');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Crea turno - {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: it })}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* User Selection */}
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dipendente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona dipendente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users?.map((user) => (
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

            {/* Shift Type */}
            <FormField
              control={form.control}
              name="shift_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo di turno</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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

            {/* Half day type */}
            {watchShiftType === 'half_day' && (
              <FormField
                control={form.control}
                name="half_day_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Parte della giornata</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="morning" id="morning" />
                          <FormLabel htmlFor="morning" className="font-normal cursor-pointer">
                            Mattina
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="afternoon" id="afternoon" />
                          <FormLabel htmlFor="afternoon" className="font-normal cursor-pointer">
                            Pomeriggio
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Notes */}
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
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creazione...' : 'Crea turno'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}