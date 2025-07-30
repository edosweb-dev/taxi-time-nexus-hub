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
import { UserFilterDropdown } from './filters/UserFilterDropdown';
import { toast } from '@/components/ui/sonner';
import { useShifts } from './ShiftContext';
import { Calendar, Users, Clock, Target } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import { useUsers } from '@/hooks/useUsers';

const batchShiftSchema = z.object({
  targetMonth: z.date(),
  targetType: z.enum(['all', 'specific']),
  shiftType: z.enum(['specific_hours', 'full_day', 'half_day', 'sick_leave', 'unavailable']),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  halfDayType: z.enum(['morning', 'afternoon']).optional(),
  weekdays: z.array(z.number()).min(1, 'Seleziona almeno un giorno'),
  periodType: z.enum(['week', 'month']),
  weekNumber: z.number().optional(),
});

type BatchShiftFormValues = z.infer<typeof batchShiftSchema>;

interface BatchShiftFormProps {
  currentMonth: Date;
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

const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function BatchShiftForm({ 
  currentMonth, 
  onClose, 
  onStartProgress, 
  onUpdateProgress, 
  onCompleteProgress 
}: BatchShiftFormProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createShift } = useShifts();
  const { users: allUsers } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });

  const form = useForm<BatchShiftFormValues>({
    resolver: zodResolver(batchShiftSchema),
    defaultValues: {
      targetMonth: currentMonth,
      targetType: 'all',
      weekdays: [],
      periodType: 'month',
    },
  });

  const watchTargetType = form.watch('targetType');
  const watchShiftType = form.watch('shiftType');
  const watchPeriodType = form.watch('periodType');
  const watchTargetMonth = form.watch('targetMonth');

  const getMonthWeeks = (date: Date) => {
    try {
      const weeks = [];
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      let currentWeek = 1;
      let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      
      while (weekStart <= monthEnd && currentWeek <= 5) {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const daysInMonth = eachDayOfInterval({
          start: weekStart,
          end: weekEnd
        }).filter(day => isWithinInterval(day, { start: monthStart, end: monthEnd }));
        
        if (daysInMonth.length > 0) {
          weeks.push({
            number: currentWeek,
            label: `Settimana ${currentWeek} (${format(weekStart, 'd MMM', { locale: it })} - ${format(weekEnd, 'd MMM', { locale: it })})`
          });
        }
        currentWeek++;
        weekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      
      return weeks;
    } catch (error) {
      console.error('Error calculating weeks:', error);
      return [];
    }
  };

  const monthWeeks = getMonthWeeks(watchTargetMonth);

  const onSubmit = async (data: BatchShiftFormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Batch shift data:', data, 'Selected users:', selectedUserIds);
      
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

      // Get target users - fetch employees if "all" is selected
      const targetUsers = data.targetType === 'all' 
        ? (allUsers?.filter(user => ['admin', 'socio', 'dipendente'].includes(user.role)) || []).map(user => user.id)
        : selectedUserIds;

      // Calculate dates to apply shifts
      const monthStart = startOfMonth(data.targetMonth);
      const monthEnd = endOfMonth(data.targetMonth);
      
      let datesToApply: Date[] = [];
      
      if (data.periodType === 'month') {
        // Apply to all specified weekdays in the month
        const allDates = eachDayOfInterval({ start: monthStart, end: monthEnd });
        console.log(`[BatchShiftForm] Giorni selezionati nell'UI:`, data.weekdays);
        console.log(`[BatchShiftForm] Labels giorni:`, weekdayLabels);
        
        datesToApply = allDates.filter(date => {
          // DEBUGGING: Mostra ogni data elaborata
          const jsDay = date.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mer, 4=Gio, 5=Ven, 6=Sab
          
          // Mapping corretto da JavaScript getDay() a indice UI weekdayLabels
          // weekdayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
          //                   0      1      2      3      4      5      6
          let weekdayIndex;
          if (jsDay === 0) {
            weekdayIndex = 6; // Domenica JS=0 -> UI index=6
          } else {
            weekdayIndex = jsDay - 1; // Lun=1->0, Mar=2->1, Mer=3->2, Gio=4->3, Ven=5->4, Sab=6->5
          }
          
          const isSelected = data.weekdays.includes(weekdayIndex);
          const dateString = format(date, 'yyyy-MM-dd (EEEE)', { locale: it });
          
          console.log(`[BatchShiftForm] ${dateString}: jsDay=${jsDay}, weekdayIndex=${weekdayIndex}, label="${weekdayLabels[weekdayIndex]}", selected=${isSelected}`);
          
          return isSelected;
        });
        
        console.log(`[BatchShiftForm] Date filtrate: ${datesToApply.length} su ${allDates.length} totali`);
        datesToApply.forEach(date => {
          console.log(`[BatchShiftForm] Data inclusa: ${format(date, 'yyyy-MM-dd (EEEE)', { locale: it })}`);
        });
      } else if (data.periodType === 'week' && data.weekNumber) {
        // Apply to specific week
        const weekStart = startOfWeek(
          new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 + (data.weekNumber - 1) * 7),
          { weekStartsOn: 1 }
        );
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        
        const weekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });
        datesToApply = weekDates.filter(date => {
          if (!isWithinInterval(date, { start: monthStart, end: monthEnd })) {
            return false;
          }
          
          // Stessa correzione per le settimane
          let weekdayIndex;
          if (date.getDay() === 0) {
            weekdayIndex = 6; // Domenica
          } else {
            weekdayIndex = date.getDay() - 1; // Lun-Sab
          }
          
          console.log(`[BatchShiftForm] Settimana - Data ${format(date, 'yyyy-MM-dd')}, getDay()=${date.getDay()}, weekdayIndex=${weekdayIndex}, selected=${data.weekdays.includes(weekdayIndex)}`);
          return data.weekdays.includes(weekdayIndex);
        });
      }

      // Create shifts for each date and user
      const shiftsToCreate = [];
      
      for (const date of datesToApply) {
        // Create individual shifts for each target user
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

      // Chiudi il form e avvia il progresso
      onClose();
      onStartProgress(shiftsToCreate.length);
      
      // Crea tutti i turni con tracking del progresso
      console.log(`Creazione di ${shiftsToCreate.length} turni`);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const shiftData of shiftsToCreate) {
        try {
          const dateString = format(shiftData.shift_date, 'yyyy-MM-dd (EEEE)', { locale: it });
          const user = allUsers?.find(u => u.id === shiftData.user_id);
          const userName = user ? `${user.first_name} ${user.last_name}` : shiftData.user_id;
          
          console.log(`🔄 [CREATION LOG] Tentativo creazione turno ${successCount + errorCount + 1}/${shiftsToCreate.length}:`);
          console.log(`   📅 Data: ${dateString}`);
          console.log(`   👤 Utente: ${userName} (${shiftData.user_id})`);
          console.log(`   ⏰ Tipo: ${shiftData.shift_type}`);
          console.log(`   🕐 Orario: ${shiftData.start_time || 'N/A'} - ${shiftData.end_time || 'N/A'}`);
          
          await createShift(shiftData);
          
          console.log(`✅ [CREATION LOG] Turno creato con successo per ${userName} il ${dateString}`);
          successCount++;
          onUpdateProgress(successCount, errorCount);
        } catch (error) {
          const dateString = format(shiftData.shift_date, 'yyyy-MM-dd (EEEE)', { locale: it });
          const user = allUsers?.find(u => u.id === shiftData.user_id);
          const userName = user ? `${user.first_name} ${user.last_name}` : shiftData.user_id;
          
          console.error(`❌ [CREATION LOG] ERRORE creazione turno per ${userName} il ${dateString}:`);
          console.error(`   🔍 Dettagli errore:`, error);
          console.error(`   📋 Dati turno che ha fallito:`, shiftData);
          
          errorCount++;
          onUpdateProgress(successCount, errorCount);
        }
        
        // Piccola pausa per permettere l'aggiornamento della UI
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Creazione completata
      onCompleteProgress();
      
      // Mostra toast finale
      if (successCount > 0) {
        toast.success(`${successCount} turni creati con successo`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} turni non creati per errori`);
      }
      
    } catch (error) {
      console.error('Error creating batch shifts:', error);
      toast.error('Errore nella creazione dei turni');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6" />
            Inserisci turni
          </CardTitle>
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
                            <Input 
                              type="time" 
                              {...field} 
                              value={field.value || ''}
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
                          <FormLabel>Ora fine</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              {...field} 
                              value={field.value || ''}
                            />
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
                        <FormItem className="space-y-3">
                          <FormLabel>Parte della giornata</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
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
                  </div>
                )}
              </div>

              {/* Weekdays */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-base">Giorni della Settimana</h3>
                </div>
                
                <FormField
                  control={form.control}
                  name="weekdays"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-7 gap-3">
                        {weekdayLabels.map((day, index) => (
                          <FormField
                            key={index}
                            control={form.control}
                            name="weekdays"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={index}
                                  className="flex flex-col items-center space-y-2 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(index)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, index])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== index
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-medium cursor-pointer">
                                    {day}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Period Type */}
              <div className="space-y-4">
                <h3 className="font-semibold text-base">Periodo di Applicazione</h3>
                
                <FormField
                  control={form.control}
                  name="periodType"
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
                              <RadioGroupItem value="month" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Tutto il mese
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="week" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Settimana specifica
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchPeriodType === 'week' && (
                  <div className="pl-6 border-l-2 border-muted">
                    <FormField
                      control={form.control}
                      name="weekNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Settimana</FormLabel>
                          <Select 
                            value={field.value?.toString() || ''} 
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
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

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t bg-muted/30 -mx-6 px-6 -mb-6 pb-6">
                <Button type="button" variant="outline" onClick={onClose} size="lg">
                  Annulla
                </Button>
                <Button type="submit" disabled={isSubmitting} size="lg" className="min-w-[120px]">
                  {isSubmitting ? 'Creazione...' : 'Crea Turni'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}