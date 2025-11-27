import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useShifts } from './ShiftContext';
import { Loader2, Trash2, Save, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Import the refactored components
import { DeleteConfirmDialog } from './dialogs/DeleteConfirmDialog';
import { shiftFormSchema, type ShiftFormValues } from './dialogs/ShiftFormSchema';
import { HalfDayTypeField, ShiftUserSelect, ShiftTypeSelect } from './form-fields';
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
  const isMobile = useIsMobile();
  const isEditing = !!selectedShift;

  // Initialize form
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      user_id: defaultUserId || user?.id || '',
      shift_date: defaultDate || new Date(),
      shift_type: 'full_day',
      start_time: null,
      end_time: null,
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
        shift_type: 'full_day',
        start_time: null,
        end_time: null,
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
      
      // Validate half day type if half day selected
      if (data.shift_type === 'half_day' && !data.half_day_type) {
        toast.error('Seleziona mattina o pomeriggio');
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
        start_time: null,
        end_time: null,
        half_day_type: data.shift_type === 'half_day' ? data.half_day_type : null,
        start_date: null,
        end_date: null,
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
    setConfirmDelete(false);
    onOpenChange(false);
  };

  // Shared form content
  const FormContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* User Selection */}
        <ShiftUserSelect 
          control={form.control} 
          isAdminOrSocio={isAdminOrSocio} 
          isEditing={isEditing} 
        />

        {/* Shift Type Selection */}
        <ShiftTypeSelect 
          control={form.control} 
          setValue={form.setValue} 
        />

        {/* Half Day Type - shown inline when half_day is selected */}
        {shiftType === 'half_day' && (
          <HalfDayTypeField control={form.control} />
        )}

        {/* Action Buttons */}
        <div className={`flex ${isMobile ? 'flex-col gap-3 pt-4' : 'flex-row justify-end items-center pt-6 border-t gap-3'}`}>
          {isEditing && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 ${isMobile ? 'w-full min-h-[48px]' : 'mr-auto'}`}
            >
              <Trash2 className="h-4 w-4" />
              Elimina
            </Button>
          )}
          
          <div className={`flex gap-3 ${isMobile ? 'w-full' : ''}`}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 ${isMobile ? 'flex-1 min-h-[48px]' : ''}`}
            >
              <X className="h-4 w-4" />
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 ${isMobile ? 'flex-1 min-h-[48px]' : ''}`}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEditing ? 'Aggiorna' : 'Salva'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          open={open}
          onOpenChange={(value) => {
            if (!value) {
              form.reset();
            }
            onOpenChange(value);
          }}
        >
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>
                {isEditing ? 'Modifica Turno' : `Nuovo Turno - ${format(defaultDate || new Date(), 'EEEE d MMMM yyyy', { locale: it })}`}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <FormContent />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            if (!value) {
              form.reset();
            }
            onOpenChange(value);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Modifica Turno' : `Nuovo Turno - ${format(defaultDate || new Date(), 'EEEE d MMMM yyyy', { locale: it })}`}
              </DialogTitle>
            </DialogHeader>
            <FormContent />
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm delete dialog */}
      <DeleteConfirmDialog 
        open={confirmDelete} 
        onOpenChange={setConfirmDelete}
        onDelete={handleDelete}
      />
    </>
  );
}