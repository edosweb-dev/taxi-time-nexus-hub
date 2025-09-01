import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { UserFilterDropdown } from '@/components/shifts/filters/UserFilterDropdown';
import { toast } from '@/components/ui/sonner';
import { Calendar, Users, Clock, Target, X } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { useUsers } from '@/hooks/useUsers';
import { calculateBatchDates, getMonthWeeks, WEEKDAY_LABELS } from '@/components/shifts/utils/dateUtils';
import { validateBatchShifts, createBatchShifts } from '@/components/shifts/utils/batchValidation';

const inserimentoMassivoSchema = z.object({
  targetMonth: z.date(),
  targetType: z.enum(['all', 'specific']),
  shiftType: z.enum(['specific_hours', 'full_day', 'half_day', 'sick_leave', 'unavailable']),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  halfDayType: z.enum(['morning', 'afternoon']).optional(),
  weekdays: z.array(z.number()).min(1, 'Seleziona almeno un giorno'),
  periodType: z.enum(['week', 'month', 'custom_weeks', 'workdays']),
  weekNumber: z.number().optional(),
  selectedWeeks: z.array(z.number()).optional(),
});

type InserimentoMassivoFormValues = z.infer<typeof inserimentoMassivoSchema>;

interface InserimentoMassivoDialogProps {
  currentDate: Date;
  onClose: () => void;
  onStartProgress: (total: number) => void;
  onUpdateProgress: (created: number, errors: number) => void;
  onCompleteProgress: () => void;
}

const shiftTypeLabels = {
  specific_hours: 'Orario specifico',
  full_day: 'Giornata intera',
  half_day: 'Mezza giornata',
  sick_leave: 'Malattia',
  unavailable: 'Non disponibile'
};

export function InserimentoMassivoDialog({ 
  currentDate, 
  onClose, 
  onStartProgress, 
  onUpdateProgress, 
  onCompleteProgress 
}: InserimentoMassivoDialogProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { users: allUsers } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });

  const form = useForm<InserimentoMassivoFormValues>({
    resolver: zodResolver(inserimentoMassivoSchema),
    defaultValues: {
      targetMonth: currentDate,
      targetType: 'all',
      weekdays: [],
      periodType: 'month',
      selectedWeeks: [],
    },
  });

  const watchTargetType = form.watch('targetType');
  const watchShiftType = form.watch('shiftType');
  const watchPeriodType = form.watch('periodType');
  const watchTargetMonth = form.watch('targetMonth');

  const monthWeeks = getMonthWeeks(watchTargetMonth);

  // Preset per giorni lavorativi (Lun-Ven)
  const setWorkdays = () => {
    form.setValue('weekdays', [0, 1, 2, 3, 4]); // Lun-Ven
    form.setValue('periodType', 'workdays');
  };

  // Preset per tutta la settimana
  const setAllWeek = () => {
    form.setValue('weekdays', [0, 1, 2, 3, 4, 5, 6]); // Lun-Dom
    form.setValue('periodType', 'month');
  };

  const onSubmit = async (data: InserimentoMassivoFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('🚀 [INSERIMENTO MASSIVO] Avvio inserimento');
      
      // Validate specific users selection
      if (data.targetType === 'specific' && selectedUserIds.length === 0) {
        toast.error('Seleziona almeno un dipendente');
        return;
      }
      
      // Validate time fields for specific hours
      if (data.shiftType === 'specific_hours' && (!data.startTime || !data.endTime)) {
        toast.error('Inserisci orari di inizio e fine per gli orari specifici');
        return;
      }

      // Validate custom weeks selection
      if (data.periodType === 'custom_weeks' && (!data.selectedWeeks || data.selectedWeeks.length === 0)) {
        toast.error('Seleziona almeno una settimana');
        return;
      }

      // Get target users
      const targetUsers = data.targetType === 'all' 
        ? (allUsers?.filter(user => ['admin', 'socio', 'dipendente'].includes(user.role)) || []).map(user => user.id)
        : selectedUserIds;

      console.log(`👥 [INSERIMENTO MASSIVO] Utenti target: ${targetUsers.length}`);

      // Calculate dates using optimized utility
      let datesToApply: Date[] = [];
      
      if (data.periodType === 'custom_weeks' && data.selectedWeeks && data.selectedWeeks.length > 0) {
        // Calculate dates for multiple selected weeks
        for (const weekNumber of data.selectedWeeks) {
          const weekDates = calculateBatchDates({
            targetMonth: data.targetMonth,
            periodType: 'week',
            weekdays: data.weekdays,
            weekNumber: weekNumber
          });
          datesToApply.push(...weekDates);
        }
        // Remove duplicates
        datesToApply = Array.from(new Set(datesToApply.map(d => d.getTime()))).map(t => new Date(t));
      } else {
        const validPeriodType = data.periodType === 'workdays' ? 'month' : 
                              data.periodType === 'custom_weeks' ? 'month' : 
                              data.periodType;
        
        datesToApply = calculateBatchDates({
          targetMonth: data.targetMonth,
          periodType: validPeriodType as 'week' | 'month',
          weekdays: data.weekdays,
          weekNumber: data.weekNumber
        });
      }

      if (datesToApply.length === 0) {
        toast.error('Nessuna data valida trovata per i giorni selezionati');
        return;
      }

      // Create shift objects
      const shiftsToCreate = [];
      
      for (const date of datesToApply) {
        for (const userId of targetUsers) {
          shiftsToCreate.push({
            user_id: userId,
            shift_date: date,
            shift_type: data.shiftType,
            start_time: data.startTime || null,
            end_time: data.endTime || null,
            half_day_type: data.halfDayType || null,
            start_date: null,
            end_date: null,
            notes: null,
          });
        }
      }

      console.log(`📝 [INSERIMENTO MASSIVO] Turni da creare: ${shiftsToCreate.length}`);

      // Pre-validate the entire batch
      const validation = await validateBatchShifts(shiftsToCreate);
      
      console.log(`✅ [INSERIMENTO MASSIVO] Validi: ${validation.validShifts.length}`);
      console.log(`❌ [INSERIMENTO MASSIVO] Non validi: ${validation.invalidShifts.length}`);

      // Close dialog and start progress tracking
      onClose();
      onStartProgress(validation.validShifts.length);
      
      // Create valid shifts
      const result = await createBatchShifts(
        validation.validShifts,
        allUsers?.find(u => u.id === targetUsers[0])?.id || targetUsers[0],
        (created, total) => {
          onUpdateProgress(created, validation.invalidShifts.length);
        }
      );
      
      // Complete progress tracking
      onCompleteProgress();
      
      // Show final results
      if (result.created > 0) {
        toast.success(`${result.created} turni creati con successo`);
      }
      
      const totalErrors = validation.invalidShifts.length + result.errors.length;
      if (totalErrors > 0) {
        toast.error(`${totalErrors} turni non creati (${validation.invalidShifts.length} conflitti, ${result.errors.length} errori)`);
      }
      
    } catch (error) {
      console.error('❌ [INSERIMENTO MASSIVO] Errore:', error);
      toast.error('Errore nell\'inserimento massivo dei turni');
      onCompleteProgress();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6" />
              Inserimento Massivo Turni
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Configura e applica turni per più dipendenti contemporaneamente
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Month Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-base">Mese di Destinazione</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="targetMonth"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={format(field.value, 'yyyy-MM')}
                        onValueChange={(value) => {
                          const [year, month] = value.split('-');
                          field.onChange(new Date(parseInt(year), parseInt(month) - 1, 1));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue>
                              {format(field.value, 'MMMM yyyy', { locale: it })}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => {
                            const date = addMonths(new Date(), i - 6);
                            return (
                              <SelectItem
                                key={format(date, 'yyyy-MM')}
                                value={format(date, 'yyyy-MM')}
                              >
                                {format(date, 'MMMM yyyy', { locale: it })}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Target Users */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-base">Destinatari</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="targetType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="all" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Tutti i dipendenti
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="specific" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Dipendenti specifici
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchTargetType === 'specific' && (
                  <div className="pl-6 border-l-2 border-muted">
                    <UserFilterDropdown
                      selectedUserIds={selectedUserIds}
                      onSelectUsers={setSelectedUserIds}
                      showOnlyAdminAndSocio={false}
                    />
                  </div>
                )}
              </div>

              {/* Days Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-base">Giorni</h3>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={setWorkdays}
                  >
                    Giorni Lavorativi (Lun-Ven)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={setAllWeek}
                  >
                    Tutta la Settimana
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="weekdays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleziona i giorni della settimana</FormLabel>
                      <div className="grid grid-cols-7 gap-2">
                        {WEEKDAY_LABELS.map((day, index) => (
                          <FormItem
                            key={index}
                            className="flex flex-col items-center space-x-0 space-y-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(index)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, index]);
                                  } else {
                                    field.onChange(current.filter(item => item !== index));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-xs text-center">
                              {day}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Shift Type */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-base">Tipo di Turno</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="shiftType"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona tipo di turno" />
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
                  <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ora inizio</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ora fine</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Half day type */}
                {watchShiftType === 'half_day' && (
                  <div className="pl-6 border-l-2 border-muted">
                    <FormField
                      control={form.control}
                      name="halfDayType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo mezza giornata</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">Mattina</SelectItem>
                              <SelectItem value="afternoon">Pomeriggio</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Period Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-base">Periodo di Applicazione</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="periodType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="month" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Tutto il mese
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="custom_weeks" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Settimane specifiche
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="week" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Una settimana specifica
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Multiple weeks selection */}
                {watchPeriodType === 'custom_weeks' && (
                  <div className="pl-6 border-l-2 border-muted">
                    <FormField
                      control={form.control}
                      name="selectedWeeks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seleziona le settimane</FormLabel>
                          <div className="space-y-2">
                            {monthWeeks.map((week) => (
                              <FormItem
                                key={week.number}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(week.number)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, week.number]);
                                      } else {
                                        field.onChange(current.filter(item => item !== week.number));
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {week.label}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Single week selection */}
                {watchPeriodType === 'week' && (
                  <div className="pl-6 border-l-2 border-muted">
                    <FormField
                      control={form.control}
                      name="weekNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seleziona settimana</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona settimana" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {monthWeeks.map((week) => (
                                <SelectItem key={week.number} value={week.number.toString()}>
                                  {week.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creazione in corso...' : 'Crea Turni'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}