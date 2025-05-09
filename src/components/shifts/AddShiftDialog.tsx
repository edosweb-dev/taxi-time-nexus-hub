
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useShifts } from './ShiftContext';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Import the refactored components
import { DeleteConfirmDialog } from './dialogs/DeleteConfirmDialog';
import { shiftFormSchema, type ShiftFormValues } from './dialogs/ShiftFormSchema';
import {
  ShiftDateField,
  ShiftTimeFields,
  HalfDayTypeField,
  ShiftUserSelect,
  ShiftTypeSelect,
  ShiftNotesField,
  DateRangeFields
} from './form-fields';
import { ShiftFormData } from './types';

interface AddShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdminOrSocio: boolean;
  defaultDate?: Date | null;
  defaultUserId?: string | null;
}

export function AddShiftDialog({ 
  open, 
  onOpenChange, 
  isAdminOrSocio,
  defaultDate,
  defaultUserId
}: AddShiftDialogProps) {
  const { user } = useAuth();
  const { createShift, updateShift, deleteShift, selectedShift, setSelectedShift } = useShifts();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEditing = !!selectedShift;

  // Initialize form
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      user_id: defaultUserId || user?.id || '',
      shift_date: defaultDate || new Date(),
      shift_type: 'specific_hours',
      start_time: '09:00',
      end_time: '17:00',
      half_day_type: null,
      start_date: null,
      end_date: null,
      notes: ''
    }
  });

  // Watch form values for conditional fields
  const shiftType = form.watch('shift_type');

  // Set form values when selected shift changes
  useEffect(() => {
    if (selectedShift) {
      form.reset({
        user_id: selectedShift.user_id,
        shift_date: new Date(selectedShift.shift_date),
        shift_type: selectedShift.shift_type,
        start_time: selectedShift.start_time || undefined,
        end_time: selectedShift.end_time || undefined,
        half_day_type: selectedShift.half_day_type,
        start_date: selectedShift.start_date ? new Date(selectedShift.start_date) : null,
        end_date: selectedShift.end_date ? new Date(selectedShift.end_date) : null,
        notes: selectedShift.notes || ''
      });
    } else if (defaultDate || defaultUserId) {
      form.reset({
        user_id: defaultUserId || user?.id || '',
        shift_date: defaultDate || new Date(),
        shift_type: 'specific_hours',
        start_time: '09:00',
        end_time: '17:00',
        half_day_type: null,
        start_date: null,
        end_date: null,
        notes: ''
      });
    }
  }, [selectedShift, form, defaultDate, defaultUserId, user?.id]);

  // Clear selected shift when dialog closes
  useEffect(() => {
    if (!open && selectedShift) {
      setSelectedShift(null);
    }
  }, [open, selectedShift, setSelectedShift]);

  // Handle form submission
  const onSubmit = async (data: ShiftFormValues) => {
    try {
      setIsLoading(true);
      
      // Validate time fields if specific hours type
      if (data.shift_type === 'specific_hours') {
        if (!data.start_time || !data.end_time) {
          toast.error('Inserisci gli orari di inizio e fine');
          setIsLoading(false);
          return;
        }
      }
      
      // Validate half day type if half day selected
      if (data.shift_type === 'half_day' && !data.half_day_type) {
        toast.error('Seleziona mattina o pomeriggio');
        setIsLoading(false);
        return;
      }

      // Validate start/end date for sick leave and unavailable
      if ((data.shift_type === 'sick_leave' || data.shift_type === 'unavailable') && !data.start_date) {
        toast.error('Seleziona una data di inizio');
        setIsLoading(false);
        return;
      }

      // Validate end date is after start date if both provided
      if (data.start_date && data.end_date && data.end_date < data.start_date) {
        toast.error('La data di fine deve essere successiva alla data di inizio');
        setIsLoading(false);
        return;
      }
      
      const formData: ShiftFormData = {
        user_id: data.user_id,
        shift_date: data.shift_date,
        shift_type: data.shift_type,
        start_time: data.shift_type === 'specific_hours' ? data.start_time || null : null,
        end_time: data.shift_type === 'specific_hours' ? data.end_time || null : null,
        half_day_type: data.shift_type === 'half_day' ? data.half_day_type : null,
        start_date: ['sick_leave', 'unavailable'].includes(data.shift_type) ? data.start_date : null,
        end_date: ['sick_leave', 'unavailable'].includes(data.shift_type) ? data.end_date : null,
        notes: data.notes
      };

      if (isEditing && selectedShift) {
        await updateShift(selectedShift.id, formData);
      } else {
        await createShift(formData);
      }

      onOpenChange(false);
      
    } catch (error) {
      console.error('Error submitting shift:', error);
      toast.error('Errore nel salvataggio del turno');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedShift) return;
    await deleteShift(selectedShift.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => {
        if (!value) {
          form.reset();
        }
        onOpenChange(value);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Modifica turno' : 'Aggiungi turno'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              {/* User selection (for admins and soci) */}
              <ShiftUserSelect 
                control={form.control} 
                isAdminOrSocio={isAdminOrSocio} 
                isEditing={isEditing} 
              />

              {/* Shift date */}
              <ShiftDateField 
                control={form.control}
                name="shift_date"
                label="Data del turno"
              />

              {/* Shift type */}
              <ShiftTypeSelect 
                control={form.control} 
                setValue={form.setValue} 
              />

              {/* Specific hours time fields */}
              {shiftType === 'specific_hours' && (
                <ShiftTimeFields control={form.control} />
              )}

              {/* Half day type */}
              {shiftType === 'half_day' && (
                <HalfDayTypeField control={form.control} />
              )}

              {/* Start and End date for sick leave and unavailable */}
              {(shiftType === 'sick_leave' || shiftType === 'unavailable') && (
                <DateRangeFields control={form.control} />
              )}

              {/* Notes */}
              <ShiftNotesField control={form.control} />

              <DialogFooter className="pt-4 flex justify-between">
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Annulla
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Aggiorna' : 'Salva'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <DeleteConfirmDialog 
        open={confirmDelete} 
        onOpenChange={setConfirmDelete}
        onDelete={handleDelete}
      />
    </>
  );
}
