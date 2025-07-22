
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useShifts } from './ShiftContext';
import { ShiftFormData, Shift } from './types';
import { shiftFormSchema, ShiftFormValues } from './dialogs/ShiftFormSchema';
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

  const form = useForm<ShiftFormValues>({
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

  const onSubmit = async (data: ShiftFormValues) => {
    try {
      const formData: ShiftFormData = {
        user_id: data.user_id,
        shift_date: data.shift_date,
        shift_type: data.shift_type,
        start_time: data.start_time,
        end_time: data.end_time,
        half_day_type: data.half_day_type,
        start_date: data.start_date,
        end_date: data.end_date,
        notes: data.notes,
      };

      if (editingShift) {
        await updateShift(editingShift.id, formData);
      } else {
        await createShift(formData);
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
            control={form.control}
            isAdminOrSocio={isAdminOrSocio}
            isEditing={!!editingShift}
          />
          
          <ShiftDateField 
            control={form.control}
            name="shift_date"
            label="Data turno"
          />
          
          <ShiftTypeSelect 
            control={form.control}
            setValue={form.setValue}
          />
          
          {shiftType === 'specific_hours' && (
            <ShiftTimeFields 
              control={form.control}
            />
          )}
          
          {shiftType === 'half_day' && (
            <HalfDayTypeField 
              control={form.control}
            />
          )}
          
          {(shiftType === 'sick_leave' || shiftType === 'unavailable') && (
            <DateRangeFields 
              control={form.control}
            />
          )}
          
          <ShiftNotesField 
            control={form.control}
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
