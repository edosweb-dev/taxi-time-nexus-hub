
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { useEffect, useState } from 'react';
import { Loader2, Trash2, Info, Clock, Calendar as CalendarIcon, User, Save, X, Settings, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

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
  const { createShift, updateShift, deleteShift, selectedShift, setSelectedShift } = useShifts();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEditing = !!editingShift;

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      user_id: defaultUserId || (isAdminOrSocio ? '' : user?.id || ''),
      shift_date: defaultDate || new Date(),
      shift_type: 'specific_hours',
      start_time: '09:00',
      end_time: '17:00',
      half_day_type: null,
      start_date: null,
      end_date: null,
      notes: ''
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
        shift_type: 'specific_hours',
        start_time: '09:00',
        end_time: '17:00',
        half_day_type: null,
        start_date: null,
        end_date: null,
        notes: ''
      });
    }
  }, [editingShift, defaultDate, defaultUserId, form, isAdminOrSocio, user?.id]);

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

      if (editingShift) {
        await updateShift(editingShift.id, formData);
      } else {
        await createShift(formData);
      }

      onOpenChange(false);
      form.reset();
      
    } catch (error) {
      console.error('Error saving shift:', error);
      toast.error('Errore nel salvataggio del turno');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!editingShift) return;
    try {
      setIsLoading(true);
      await deleteShift(editingShift.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error('Errore nell\'eliminazione del turno');
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Assegnazione e Data - Layout minimalista */}
        <div className="grid grid-cols-2 gap-4">
          <ShiftUserSelect 
            control={form.control}
            isAdminOrSocio={isAdminOrSocio}
            isEditing={isEditing}
          />
          
          <ShiftDateField 
            control={form.control}
            name="shift_date"
            label="Data turno"
          />
        </div>
        
        {/* Tipo di Turno */}
        <ShiftTypeSelect 
          control={form.control}
          setValue={form.setValue}
        />
        
        {/* Orari specifici */}
        {shiftType === 'specific_hours' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Orari</label>
            <ShiftTimeFields control={form.control} />
          </div>
        )}
        
        {/* Mezza giornata */}
        {shiftType === 'half_day' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Periodo</label>
            <HalfDayTypeField control={form.control} />
          </div>
        )}
        
        {/* Periodi per malattia/indisponibilità */}
        {(shiftType === 'sick_leave' || shiftType === 'unavailable') && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Periodo di {shiftType === 'sick_leave' ? 'malattia' : 'indisponibilità'}
            </label>
            <DateRangeFields control={form.control} />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-3">
          {isEditing && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Elimina Turno
            </Button>
          )}
          
          <div className="flex gap-3 ml-auto">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEditing ? 'Aggiorna Turno' : 'Salva Turno'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
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
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-3 pb-6">
          <SheetTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {isEditing ? 'Modifica Turno' : 'Nuovo Turno'}
          </SheetTitle>
          <SheetDescription>
            {isEditing 
              ? 'Modifica i dettagli del turno esistente.' 
              : 'Inserisci i dettagli del nuovo turno. Tutti i campi obbligatori sono contrassegnati.'}
          </SheetDescription>
        </SheetHeader>
        
        {content}
      </SheetContent>
    </Sheet>
  );
}
