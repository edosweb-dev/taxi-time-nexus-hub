
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useShifts, ShiftType, HalfDayType, ShiftFormData } from './ShiftContext';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, Clock, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

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
  const { user, profile } = useAuth();
  const { createShift, updateShift, deleteShift, selectedShift, setSelectedShift } = useShifts();
  const [users, setUsers] = useState<{ id: string; first_name: string | null; last_name: string | null }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEditing = !!selectedShift;

  // Define form validation schema
  const formSchema = z.object({
    user_id: z.string({
      required_error: "Seleziona un utente"
    }),
    shift_date: z.date({
      required_error: "Seleziona una data"
    }),
    shift_type: z.enum(['specific_hours', 'full_day', 'half_day', 'sick_leave', 'unavailable'], {
      required_error: "Seleziona un tipo di turno"
    }),
    start_time: z.string().optional().nullable(),
    end_time: z.string().optional().nullable(),
    half_day_type: z.enum(['morning', 'afternoon']).optional().nullable(),
    start_date: z.date().optional().nullable(),
    end_date: z.date().optional().nullable(),
    notes: z.string().optional()
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: defaultUserId || user?.id || '',
      shift_date: defaultDate || new Date(),
      shift_type: 'specific_hours' as ShiftType,
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

  // Fetch users if admin or socio
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (isAdminOrSocio) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, role')
            .in('role', ['admin', 'socio', 'dipendente']);

          if (error) throw error;
          setUsers(data || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Errore nel caricamento degli utenti');
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [isAdminOrSocio, open]);

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
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
        half_day_type: data.shift_type === 'half_day' ? data.half_day_type as HalfDayType : null,
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
    
    try {
      setIsDeleting(true);
      await deleteShift(selectedShift.id);
      setConfirmDelete(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error('Errore nell\'eliminazione del turno');
    } finally {
      setIsDeleting(false);
    }
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
              {isAdminOrSocio && (
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utente</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isEditing && !isAdminOrSocio}
                      >
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
                          {profile && (
                            <SelectItem value={profile.id}>
                              {profile.first_name} {profile.last_name} (Tu)
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Shift date */}
              <FormField
                control={form.control}
                name="shift_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data del turno</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: it })
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
                          initialFocus
                          locale={it}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shift type */}
              <FormField
                control={form.control}
                name="shift_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo di turno</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset conditional fields
                        if (value !== 'specific_hours') {
                          form.setValue('start_time', null);
                          form.setValue('end_time', null);
                        }
                        if (value !== 'half_day') {
                          form.setValue('half_day_type', null);
                        }
                        if (!['sick_leave', 'unavailable'].includes(value)) {
                          form.setValue('start_date', null);
                          form.setValue('end_date', null);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un tipo di turno" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="specific_hours">Orario specifico</SelectItem>
                        <SelectItem value="full_day">Giornata intera</SelectItem>
                        <SelectItem value="half_day">Mezza giornata</SelectItem>
                        <SelectItem value="sick_leave">Malattia</SelectItem>
                        <SelectItem value="unavailable">Non disponibile</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specific hours time fields */}
              {shiftType === 'specific_hours' && (
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Orario inizio</FormLabel>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <input
                              type="time"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Orario fine</FormLabel>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <input
                              type="time"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value || ''}
                              onChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Half day type */}
              {shiftType === 'half_day' && (
                <FormField
                  control={form.control}
                  name="half_day_type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Parte della giornata</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value || undefined}
                          value={field.value || undefined}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="morning" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Mattina
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="afternoon" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Pomeriggio
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Start and End date for sick leave and unavailable */}
              {(shiftType === 'sick_leave' || shiftType === 'unavailable') && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data inizio</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: it })
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
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                              locale={it}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data fine (opzionale)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: it })
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
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                              locale={it}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                        placeholder="Inserisci eventuali note..." 
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 flex justify-between">
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={() => setConfirmDelete(true)}
                    disabled={isLoading || isDeleting}
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
                    disabled={isLoading || isDeleting}
                  >
                    Annulla
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || isDeleting}
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
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il turno verrà eliminato permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
