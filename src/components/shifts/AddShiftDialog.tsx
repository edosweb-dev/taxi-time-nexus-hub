import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useShifts } from './ShiftContext';
import { Loader2, Trash2, Info, Clock, Calendar as CalendarIcon, User, Save, X, Settings, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
import { MobileShiftFormWrapper, MobileShiftSelector } from './mobile';

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
    setConfirmDelete(false);
    onOpenChange(false);
  };

  // Shared form content
  const FormContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Card Assegnazione e Data - Mobile ottimizzato */}
        <Card className={`border-l-4 border-l-primary ${isMobile ? 'shadow-sm' : ''}`}>
          <CardHeader className={`pb-3 ${isMobile ? 'px-4 py-3' : 'pb-4'}`}>
            <CardTitle className={`card-title flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
              <User className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
              Assegnazione e Data
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'px-4 pb-4' : ''}>
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
              <ShiftUserSelect 
                control={form.control} 
                isAdminOrSocio={isAdminOrSocio} 
                isEditing={isEditing} 
              />
              <ShiftDateField 
                control={form.control}
                name="shift_date"
                label="Data del turno"
              />
            </div>
          </CardContent>
        </Card>

        {/* Card Tipo e Orari - Mobile ottimizzato */}
        <Card className={`border-l-4 border-l-blue-500 ${isMobile ? 'shadow-sm' : ''}`}>
          <CardHeader className={`pb-3 ${isMobile ? 'px-4 py-3' : 'pb-4'}`}>
            <CardTitle className={`card-title flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
              <Clock className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-500`} />
              Tipo di Turno e Orari
            </CardTitle>
          </CardHeader>
          <CardContent className={`space-y-3 sm:space-y-4 ${isMobile ? 'px-4 pb-4' : ''}`}>
            <ShiftTypeSelect 
              control={form.control} 
              setValue={form.setValue} 
            />

            {shiftType === 'specific_hours' && (
              <div className="space-y-3 sm:space-y-4">
                {!isMobile && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Specifica gli orari di inizio e fine del turno di lavoro.
                    </AlertDescription>
                  </Alert>
                )}
                <ShiftTimeFields control={form.control} />
              </div>
            )}

            {shiftType === 'half_day' && (
              <div className="space-y-3 sm:space-y-4">
                {!isMobile && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Seleziona se il turno è nella mattina o nel pomeriggio.
                    </AlertDescription>
                  </Alert>
                )}
                <HalfDayTypeField control={form.control} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Periodi Speciali - Mobile ottimizzato */}
        {(shiftType === 'sick_leave' || shiftType === 'unavailable') && (
          <Card className={`border-l-4 border-l-amber-500 ${isMobile ? 'shadow-sm' : ''}`}>
            <CardHeader className={`pb-3 ${isMobile ? 'px-4 py-3' : 'pb-4'}`}>
              <CardTitle className={`card-title flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
                <MapPin className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-amber-500`} />
                Periodo di {shiftType === 'sick_leave' ? 'Malattia' : 'Indisponibilità'}
              </CardTitle>
            </CardHeader>
            <CardContent className={`space-y-3 sm:space-y-4 ${isMobile ? 'px-4 pb-4' : ''}`}>
              {!isMobile && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Specifica il periodo di {shiftType === 'sick_leave' ? 'malattia' : 'indisponibilità'}. 
                    Se non specifichi una data di fine, verrà considerato solo il giorno selezionato.
                  </AlertDescription>
                </Alert>
              )}
              <DateRangeFields control={form.control} />
            </CardContent>
          </Card>
        )}

        {/* Card Note - Mobile ottimizzato */}
        <Card className={`border-l-4 border-l-green-500 ${isMobile ? 'shadow-sm' : ''}`}>
          <CardHeader className={`pb-3 ${isMobile ? 'px-4 py-3' : 'pb-4'}`}>
            <CardTitle className={`card-title flex items-center gap-2 ${isMobile ? 'text-base' : ''}`}>
              <Settings className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-500`} />
              Note Aggiuntive
            </CardTitle>
          </CardHeader>
          <CardContent className={isMobile ? 'px-4 pb-4' : ''}>
            <ShiftNotesField control={form.control} />
          </CardContent>
        </Card>

        {/* Action Buttons - Mobile ottimizzati */}
        <div className={`flex ${isMobile ? 'flex-col gap-3 pt-4 sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4 -mx-4' : 'flex-col sm:flex-row justify-between items-center pt-6 border-t gap-3'}`}>
          {isEditing && (
            <Button 
              type="button" 
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 ${isMobile ? 'w-full min-h-[48px]' : ''}`}
            >
              <Trash2 className="h-4 w-4" />
              Elimina Turno
            </Button>
          )}
          
          <div className={`flex gap-3 ${isMobile ? 'w-full' : 'ml-auto'}`}>
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

  const handleMobileSubmit = async (data: ShiftFormData) => {
    if (isEditing && selectedShift) {
      await updateShift(selectedShift.id, data);
    } else {
      await createShift(data);
    }
    onOpenChange(false);
  };

  const handleMobileCancel = () => {
    onOpenChange(false);
  };

  return (
    <>
      <MobileShiftFormWrapper
        open={open}
        onOpenChange={(value) => {
          if (!value) {
            form.reset();
          }
          onOpenChange(value);
        }}
        title={isEditing ? 'Modifica Turno' : 'Nuovo Turno'}
        description={isEditing 
          ? 'Modifica i dettagli del turno esistente.' 
          : 'Inserisci i dettagli del nuovo turno.'}
      >
        {isMobile ? (
          <MobileShiftSelector
            onSubmit={handleMobileSubmit}
            onCancel={handleMobileCancel}
            isAdminOrSocio={isAdminOrSocio}
            defaultDate={defaultDate}
            defaultUserId={defaultUserId}
            selectedShift={selectedShift}
          />
        ) : (
          <FormContent />
        )}
      </MobileShiftFormWrapper>

      {/* Confirm delete dialog */}
      <DeleteConfirmDialog 
        open={confirmDelete} 
        onOpenChange={setConfirmDelete}
        onDelete={handleDelete}
      />
    </>
  );
}