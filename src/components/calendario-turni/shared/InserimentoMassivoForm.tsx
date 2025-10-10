import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { UserFilterDropdown } from '@/components/shifts/filters/UserFilterDropdown';
import { toast } from '@/hooks/use-toast';
import { Calendar, Users, Clock, Target } from 'lucide-react';
import { format, addMonths } from 'date-fns';
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

interface InserimentoMassivoFormProps {
  currentDate: Date;
  onCancel: () => void;
  onStartProgress: (total: number) => void;
  onUpdateProgress: (created: number, errors: number) => void;
  onCompleteProgress: () => void;
  showCancelButton?: boolean;
}

const shiftTypeLabels = {
  specific_hours: 'Orario specifico',
  full_day: 'Giornata intera',
  half_day: 'Mezza giornata',
  sick_leave: 'Malattia',
  unavailable: 'Non disponibile'
};

export function InserimentoMassivoForm({ 
  currentDate, 
  onCancel, 
  onStartProgress, 
  onUpdateProgress, 
  onCompleteProgress,
  showCancelButton = true
}: InserimentoMassivoFormProps) {
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
    form.setValue('weekdays', [0, 1, 2, 3, 4]);
    form.setValue('periodType', 'workdays');
  };

  // Preset per tutta la settimana
  const setAllWeek = () => {
    form.setValue('weekdays', [0, 1, 2, 3, 4, 5, 6]);
    form.setValue('periodType', 'month');
  };

  const onSubmit = async (data: InserimentoMassivoFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('🚀 [INSERIMENTO MASSIVO] Avvio inserimento');
      
      if (data.targetType === 'specific' && selectedUserIds.length === 0) {
        toast({ title: 'Errore', description: 'Seleziona almeno un dipendente', variant: 'destructive' });
        return;
      }
      
      if (data.shiftType === 'specific_hours' && (!data.startTime || !data.endTime)) {
        toast({ title: 'Errore', description: 'Inserisci orari di inizio e fine per gli orari specifici', variant: 'destructive' });
        return;
      }

      if (data.periodType === 'custom_weeks' && (!data.selectedWeeks || data.selectedWeeks.length === 0)) {
        toast({ title: 'Errore', description: 'Seleziona almeno una settimana', variant: 'destructive' });
        return;
      }

      const targetUsers = data.targetType === 'all' 
        ? (allUsers?.filter(user => ['admin', 'socio', 'dipendente'].includes(user.role)) || []).map(user => user.id)
        : selectedUserIds;

      console.log(`👥 [INSERIMENTO MASSIVO] Utenti target: ${targetUsers.length}`);

      let datesToApply: Date[] = [];
      
      if (data.periodType === 'custom_weeks' && data.selectedWeeks && data.selectedWeeks.length > 0) {
        for (const weekNumber of data.selectedWeeks) {
          const weekDates = calculateBatchDates({
            targetMonth: data.targetMonth,
            periodType: 'week',
            weekdays: data.weekdays,
            weekNumber: weekNumber
          });
          datesToApply.push(...weekDates);
        }
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
        toast({ title: 'Errore', description: 'Nessuna data valida trovata per i giorni selezionati', variant: 'destructive' });
        return;
      }

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

      const validation = await validateBatchShifts(shiftsToCreate);
      
      console.log(`✅ [INSERIMENTO MASSIVO] Validi: ${validation.validShifts.length}`);
      console.log(`❌ [INSERIMENTO MASSIVO] Non validi: ${validation.invalidShifts.length}`);

      onStartProgress(validation.validShifts.length);
      
      const result = await createBatchShifts(
        validation.validShifts,
        allUsers?.find(u => u.id === targetUsers[0])?.id || targetUsers[0],
        (created, total) => {
          onUpdateProgress(created, validation.invalidShifts.length);
        }
      );
      
      onCompleteProgress();
      
      if (result.created > 0) {
        toast({ title: 'Successo', description: `${result.created} turni creati con successo` });
      }
      
      const totalErrors = validation.invalidShifts.length + result.errors.length;
      if (totalErrors > 0) {
        toast({ 
          title: 'Attenzione', 
          description: `${totalErrors} turni non creati (${validation.invalidShifts.length} conflitti, ${result.errors.length} errori)`,
          variant: 'destructive'
        });
      }
      
    } catch (error) {
      console.error('❌ [INSERIMENTO MASSIVO] Errore:', error);
      toast({ title: 'Errore', description: 'Errore nell\'inserimento massivo dei turni', variant: 'destructive' });
      onCompleteProgress();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Month Selection */}
        <div className="space-y-3">
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
                    <SelectTrigger className="w-full min-h-[44px]">
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
        <div className="space-y-3">
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
                    className="grid grid-cols-2 gap-3"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0 min-h-[44px]">
                      <FormControl>
                        <RadioGroupItem value="all" className="min-h-[24px] min-w-[24px]" />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">
                        Tutti i dipendenti
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0 min-h-[44px]">
                      <FormControl>
                        <RadioGroupItem value="specific" className="min-h-[24px] min-w-[24px]" />
                      </FormControl>
                      <FormLabel className="font-normal text-sm">
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
            <div className="pl-4 border-l-2 border-muted">
              <UserFilterDropdown
                selectedUserIds={selectedUserIds}
                onSelectUsers={setSelectedUserIds}
                showOnlyAdminAndSocio={false}
              />
            </div>
          )}
        </div>

        {/* Period Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-base">Periodo</h3>
          </div>
          
          <FormField
            control={form.control}
            name="periodType"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder="Seleziona periodo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="month">Tutto il mese</SelectItem>
                    <SelectItem value="week">Singola settimana</SelectItem>
                    <SelectItem value="custom_weeks">Settimane specifiche</SelectItem>
                    <SelectItem value="workdays">Giorni lavorativi (Lun-Ven)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchPeriodType === 'week' && (
            <FormField
              control={form.control}
              name="weekNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seleziona settimana</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Seleziona settimana" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {monthWeeks.map((week, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Settimana {index + 1} ({format(week.start, 'd MMM')} - {format(week.end, 'd MMM')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {watchPeriodType === 'custom_weeks' && (
            <FormField
              control={form.control}
              name="selectedWeeks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seleziona settimane</FormLabel>
                  <div className="space-y-2">
                    {monthWeeks.map((week, index) => (
                      <FormItem
                        key={index}
                        className="flex items-center space-x-3 space-y-0 min-h-[44px]"
                      >
                        <FormControl>
                          <Checkbox
                            className="min-h-[24px] min-w-[24px]"
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
                        <FormLabel className="font-normal text-sm">
                          Settimana {index + 1} ({format(week.start, 'd MMM')} - {format(week.end, 'd MMM')})
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Days Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-base">Giorni</h3>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={setWorkdays}
              className="min-h-[44px]"
            >
              Giorni Lavorativi (Lun-Ven)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={setAllWeek}
              className="min-h-[44px]"
            >
              Tutta la Settimana
            </Button>
          </div>
          
          <FormField
            control={form.control}
            name="weekdays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Seleziona i giorni della settimana</FormLabel>
                <div className="grid grid-cols-7 gap-2">
                  {WEEKDAY_LABELS.map((day, index) => (
                    <FormItem
                      key={index}
                      className="flex flex-col items-center space-x-0 space-y-2"
                    >
                      <FormControl>
                        <Checkbox
                          className="min-h-[24px] min-w-[24px]"
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
        <div className="space-y-3">
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
                    <SelectTrigger className="min-h-[44px]">
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

          {watchShiftType === 'specific_hours' && (
            <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Ora inizio</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        className="min-h-[44px] text-base"
                      />
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
                    <FormLabel className="text-sm">Ora fine</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        className="min-h-[44px] text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {watchShiftType === 'half_day' && (
            <FormField
              control={form.control}
              name="halfDayType"
              render={({ field }) => (
                <FormItem className="pl-4 border-l-2 border-muted">
                  <FormLabel className="text-sm">Tipo mezza giornata</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Seleziona periodo" />
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
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 min-h-[44px]"
            >
              Annulla
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 min-h-[44px]"
          >
            {isSubmitting ? 'Creazione in corso...' : 'Crea Turni'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
