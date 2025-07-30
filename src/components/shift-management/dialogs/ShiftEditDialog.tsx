import { useState, useEffect } from 'react';
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
import { Shift } from '@/components/shifts/types';

const shiftEditSchema = z.object({
  user_id: z.string().min(1, 'Seleziona un dipendente'),
  shift_type: z.enum(['specific_hours', 'full_day', 'half_day', 'sick_leave', 'unavailable']),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  half_day_type: z.enum(['morning', 'afternoon']).optional(),
  notes: z.string().optional(),
});

type ShiftEditFormValues = z.infer<typeof shiftEditSchema>;

interface ShiftEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  isAdminOrSocio: boolean;
}

const shiftTypeLabels = {
  specific_hours: 'Orario specifico',
  full_day: 'Giornata intera',
  half_day: 'Mezza giornata',
  sick_leave: 'Malattia',
  unavailable: 'Non disponibile'
};

export function ShiftEditDialog({
  open,
  onOpenChange,
  shift,
  isAdminOrSocio
}: ShiftEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateShift, deleteShift } = useShifts();
  const { users } = useUsers({ includeRoles: ['admin', 'socio', 'dipendente'] });

  const form = useForm<ShiftEditFormValues>({
    resolver: zodResolver(shiftEditSchema),
  });

  const watchShiftType = form.watch('shift_type');

  // Update form when shift changes
  useEffect(() => {
    if (shift) {
      form.reset({
        user_id: shift.user_id,
        shift_type: shift.shift_type as any,
        start_time: shift.start_time || '',
        end_time: shift.end_time || '',
        half_day_type: shift.half_day_type as any,
        notes: shift.notes || '',
      });
    }
  }, [shift, form]);

  const onSubmit = async (data: ShiftEditFormValues) => {
    if (!shift) return;

    setIsSubmitting(true);
    try {
      await updateShift(shift.id, {
        user_id: data.user_id!,
        shift_type: data.shift_type!,
        shift_date: new Date(shift.shift_date),
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        half_day_type: data.half_day_type || null,
        notes: data.notes || null,
        start_date: null,
        end_date: null,
      });
      
      toast.success('Turno aggiornato con successo');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('Errore nell\'aggiornamento del turno');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!shift || !confirm('Sei sicuro di voler eliminare questo turno?')) return;

    try {
      await deleteShift(shift.id);
      toast.success('Turno eliminato con successo');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error('Errore nell\'eliminazione del turno');
    }
  };

  if (!shift) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Modifica turno - {format(new Date(shift.shift_date), 'd MMMM yyyy', { locale: it })}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={!isAdminOrSocio}>
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

            {/* Time fields for specific hours */}
            {watchShiftType === 'specific_hours' && (
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ora inizio</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value || ''} />
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
                      <FormLabel>Ora fine</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

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
                          <RadioGroupItem value="morning" id="morning-edit" />
                          <FormLabel htmlFor="morning-edit" className="font-normal cursor-pointer">
                            Mattina
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="afternoon" id="afternoon-edit" />
                          <FormLabel htmlFor="afternoon-edit" className="font-normal cursor-pointer">
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
              >
                Annulla
              </Button>
              
              {isAdminOrSocio && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Elimina
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Aggiornamento...' : 'Aggiorna'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}