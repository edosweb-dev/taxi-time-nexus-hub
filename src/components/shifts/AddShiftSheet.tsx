
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useShifts } from './ShiftContext';
import { ShiftFormData, Shift } from './types';
import { shiftFormSchema } from './dialogs/ShiftFormSchema';
import { ShiftUserSelect } from './form-fields/ShiftUserSelect';
import { ShiftDateField } from './form-fields/ShiftDateField';
import { ShiftTypeSelect } from './form-fields/ShiftTypeSelect';
import { ShiftTimeFields } from './form-fields/ShiftTimeFields';
import { HalfDayTypeField } from './form-fields/HalfDayTypeField';
import { DateRangeFields } from './form-fields/DateRangeFields';
import { ShiftNotesField } from './form-fields/ShiftNotesField';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface AddShiftSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdminOrSocio: boolean;
  defaultDate?: Date | null;
  defaultUserId?: string | null;
  editingShift?: Shift | null;
  mode?: 'sheet' | 'dialog';
}

export function AddShiftSheet({ 
  open, 
  onOpenChange, 
  isAdminOrSocio, 
  defaultDate,
  defaultUserId,
  editingShift,
  mode = 'sheet'
}: AddShiftSheetProps) {
  const { user } = useAuth();
  const { createShift, updateShift } = useShifts();

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      user_id: defaultUserId || (isAdminOrSocio ? '' : user?.id || ''),
      shift_date: defaultDate || new Date(),
      shift_type: 'full_day',
      start_time: null,
      end_time: null,
      half_day_type: null,
      start_date: null,
      end_date: null,
      notes: null,
    },
  });

  const shiftType = form.watch('shift_type');

  // Update form when editing shift changes
  useEffect(() => {
    if (editingShift) {
      form.reset({
        user_id: editingShift.user_id,
        shift_date: new Date(editingShift.shift_date),
        shift_type: editingShift.shift_type,
        start_time: editingShift.start_time,
        end_time: editingShift.end_time,
        half_day_type: editingShift.half_day_type,
        start_date: editingShift.start_date ? new Date(editingShift.start_date) : null,
        end_date: editingShift.end_date ? new Date(editingShift.end_date) : null,
        notes: editingShift.notes,
      });
    } else if (defaultDate || defaultUserId) {
      form.reset({
        user_id: defaultUserId || (isAdminOrSocio ? '' : user?.id || ''),
        shift_date: defaultDate || new Date(),
        shift_type: 'full_day',
        start_time: null,
        end_time: null,
        half_day_type: null,
        start_date: null,
        end_date: null,
        notes: null,
      });
    }
  }, [editingShift, defaultDate, defaultUserId, form, isAdminOrSocio, user?.id]);

  const onSubmit = async (data: ShiftFormData) => {
    try {
      if (editingShift) {
        await updateShift(editingShift.id, data);
      } else {
        await createShift(data);
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const content = (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ShiftUserSelect 
            isAdminOrSocio={isAdminOrSocio}
            currentUserId={user?.id}
            value={form.watch('user_id')}
            onChange={(value) => form.setValue('user_id', value)}
          />
          
          <ShiftDateField 
            value={form.watch('shift_date')}
            onChange={(value) => form.setValue('shift_date', value)}
          />
          
          <ShiftTypeSelect 
            value={form.watch('shift_type')}
            onChange={(value) => form.setValue('shift_type', value)}
          />
          
          {shiftType === 'specific_hours' && (
            <ShiftTimeFields 
              startTime={form.watch('start_time')}
              endTime={form.watch('end_time')}
              onStartTimeChange={(value) => form.setValue('start_time', value)}
              onEndTimeChange={(value) => form.setValue('end_time', value)}
            />
          )}
          
          {shiftType === 'half_day' && (
            <HalfDayTypeField 
              value={form.watch('half_day_type')}
              onChange={(value) => form.setValue('half_day_type', value)}
            />
          )}
          
          {(shiftType === 'sick_leave' || shiftType === 'unavailable') && (
            <DateRangeFields 
              startDate={form.watch('start_date')}
              endDate={form.watch('end_date')}
              onStartDateChange={(value) => form.setValue('start_date', value)}
              onEndDateChange={(value) => form.setValue('end_date', value)}
            />
          )}
          
          <ShiftNotesField 
            value={form.watch('notes')}
            onChange={(value) => form.setValue('notes', value)}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button type="submit">
              {editingShift ? 'Aggiorna Turno' : 'Crea Turno'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );

  if (mode === 'dialog') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            {editingShift ? 'Modifica Turno' : 'Nuovo Turno'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editingShift ? 'Modifica i dettagli del turno' : 'Compila i dettagli per creare un nuovo turno'}
          </p>
        </div>
        {content}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {editingShift ? 'Modifica Turno' : 'Nuovo Turno'}
          </SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
