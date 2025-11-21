import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, Calendar, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { DateGridSelector } from './DateGridSelector';
import { singleUserBatchShiftSchema, type SingleUserBatchShiftFormData } from '@/lib/schemas/shifts';
import { validateBatchShifts, createBatchShifts } from '@/components/shifts/utils/batchValidation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface InserimentoSingoloUtenteFormProps {
  currentDate: Date;
  onCancel: () => void;
  onStartProgress: (total: number) => void;
  onUpdateProgress: (created: number, errors: number) => void;
  onCompleteProgress: () => void;
}

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  color: string | null;
}

const shiftTypeLabels = {
  full_day: 'Giornata intera',
  half_day: 'Mezza giornata',
  extra: 'Turno extra',
  unavailable: 'Non disponibile'
};

export function InserimentoSingoloUtenteForm({
  currentDate,
  onCancel,
  onStartProgress,
  onUpdateProgress,
  onCompleteProgress
}: InserimentoSingoloUtenteFormProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [existingShiftDates, setExistingShiftDates] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SingleUserBatchShiftFormData>({
    resolver: zodResolver(singleUserBatchShiftSchema),
    defaultValues: {
      user_id: '',
      selected_dates: [],
      shift_type: 'full_day',
      notes: ''
    }
  });

  const watchUserId = form.watch('user_id');
  const watchShiftType = form.watch('shift_type');
  const watchSelectedDates = form.watch('selected_dates');

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, color')
          .in('role', ['admin', 'socio', 'dipendente'])
          .order('first_name');

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({ title: 'Errore', description: 'Impossibile caricare gli utenti', variant: 'destructive' });
      }
    };

    fetchUsers();
  }, []);

  // Fetch existing shifts when user changes
  useEffect(() => {
    const fetchExistingShifts = async () => {
      if (!watchUserId) {
        setExistingShiftDates(new Set());
        return;
      }

      try {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const { data, error } = await supabase
          .from('shifts')
          .select('shift_date')
          .eq('user_id', watchUserId)
          .gte('shift_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('shift_date', format(monthEnd, 'yyyy-MM-dd'));

        if (error) throw error;

        const dates = new Set(data?.map(s => s.shift_date) || []);
        setExistingShiftDates(dates);
      } catch (error) {
        console.error('Error fetching existing shifts:', error);
      }
    };

    fetchExistingShifts();
  }, [watchUserId, currentDate]);

  const selectedUser = users.find(u => u.id === watchUserId);

  const canProceedToStep2 = !!watchUserId;
  const canProceedToStep3 = watchSelectedDates.length > 0;
  const canProceedToStep4 = !!watchShiftType && (
    watchShiftType !== 'half_day' || !!form.watch('half_day_type')
  );

  const onSubmit = async (data: SingleUserBatchShiftFormData) => {
    setIsSubmitting(true);
    try {
      if (!profile?.id) {
        toast({ title: 'Errore', description: 'Utente non autenticato', variant: 'destructive' });
        return;
      }

      // Prepare shifts data
      const shiftsToCreate = data.selected_dates.map(dateStr => ({
        user_id: data.user_id,
        shift_date: new Date(dateStr),
        shift_type: data.shift_type,
        half_day_type: data.half_day_type,
        notes: data.notes,
        created_by: profile.id,
        updated_by: profile.id
      }));

      console.log('🚀 [SINGLE USER BATCH] Creating shifts:', shiftsToCreate.length);

      // Validate
      const validationResult = await validateBatchShifts(shiftsToCreate);
      
      if (validationResult.invalidShifts.length > 0) {
        console.warn('⚠️ [SINGLE USER BATCH] Invalid shifts:', validationResult.invalidShifts);
        toast({
          title: 'Attenzione',
          description: `${validationResult.invalidShifts.length} turni non possono essere creati per conflitti`,
          variant: 'destructive'
        });
      }

      if (validationResult.validShifts.length === 0) {
        toast({
          title: 'Nessun turno da creare',
          description: 'Tutti i turni selezionati sono già presenti',
          variant: 'destructive'
        });
        return;
      }

      // Start progress
      onStartProgress(validationResult.validShifts.length);

      // Track errors during creation
      let errorCount = 0;

      // Create shifts
      const result = await createBatchShifts(
        validationResult.validShifts,
        profile.id,
        (created, total) => {
          onUpdateProgress(created, errorCount);
        }
      );

      // Update error count after creation
      errorCount = result.errors.length;

      console.log(`✅ [SINGLE USER BATCH] Created: ${result.created}, Errors: ${errorCount}`);

      // Final progress update before complete
      onUpdateProgress(result.created, errorCount);
      onCompleteProgress();

      toast({
        title: 'Turni creati con successo',
        description: `${result.created} turni creati${errorCount > 0 ? `, ${errorCount} errori` : ''}`,
      });

    } catch (error) {
      console.error('Error creating shifts:', error);
      toast({
        title: 'Errore',
        description: 'Errore durante la creazione dei turni',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= stepNum
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 4 && (
                <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: User Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Seleziona Dipendente</h3>
                <p className="text-sm text-muted-foreground">
                  Scegli il dipendente per cui creare i turni
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dipendente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un dipendente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: user.color || '#6B7280' }}
                            />
                            <span>
                              {user.first_name} {user.last_name}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedUser && (
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: selectedUser.color || '#6B7280' }}
                  >
                    {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Selezionato per inserimento turni
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Annulla
              </Button>
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
              >
                Continua
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Date Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Seleziona Date</h3>
                <p className="text-sm text-muted-foreground">
                  Scegli i giorni per cui creare il turno
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="selected_dates"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <DateGridSelector
                      month={currentDate}
                      selectedDates={field.value}
                      existingShiftDates={existingShiftDates}
                      onDatesChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Indietro
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
              >
                Continua
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Shift Type */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Tipo di Turno</h3>
                <p className="text-sm text-muted-foreground">
                  Seleziona il tipo di turno da applicare
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="shift_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Turno</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
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

            {watchShiftType === 'half_day' && (
              <FormField
                control={form.control}
                name="half_day_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periodo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="morning" id="morning" />
                          <label htmlFor="morning" className="cursor-pointer">
                            Mattina
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="afternoon" id="afternoon" />
                          <label htmlFor="afternoon" className="cursor-pointer">
                            Pomeriggio
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Aggiungi note per questi turni..."
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Indietro
              </Button>
              <Button
                type="button"
                onClick={() => setStep(4)}
                disabled={!canProceedToStep4}
              >
                Continua
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Summary and Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Riepilogo</h3>
                <p className="text-sm text-muted-foreground">
                  Verifica i dettagli prima di creare i turni
                </p>
              </div>
            </div>

            <Card className="p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Dipendente</p>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: selectedUser?.color || '#6B7280' }}
                  />
                  <p className="font-medium">
                    {selectedUser?.first_name} {selectedUser?.last_name}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Date selezionate</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-base">
                    {watchSelectedDates.length} {watchSelectedDates.length === 1 ? 'giorno' : 'giorni'}
                  </Badge>
                </div>
                {watchSelectedDates.length <= 10 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {watchSelectedDates.map(dateStr => (
                      <Badge key={dateStr} variant="outline" className="text-xs">
                        {format(new Date(dateStr), 'd MMM', { locale: it })}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tipo turno</p>
                <p className="font-medium mt-1">
                  {shiftTypeLabels[watchShiftType]}
                  {watchShiftType === 'half_day' && form.watch('half_day_type') && (
                    <span className="text-muted-foreground ml-2">
                      ({form.watch('half_day_type') === 'morning' ? 'Mattina' : 'Pomeriggio'})
                    </span>
                  )}
                </p>
              </div>

              {form.watch('notes') && (
                <div>
                  <p className="text-sm text-muted-foreground">Note</p>
                  <p className="text-sm mt-1">{form.watch('notes')}</p>
                </div>
              )}
            </Card>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => setStep(3)}>
                Indietro
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creazione...' : `Crea ${watchSelectedDates.length} turni`}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
