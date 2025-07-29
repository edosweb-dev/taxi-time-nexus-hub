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
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const batchShiftSchema = z.object({
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
}

const shiftTypeLabels = {
  specific_hours: 'Orario specifico',
  full_day: 'Giornata intera',
  half_day: 'Mezza giornata',
  sick_leave: 'Malattia',
  unavailable: 'Non disponibile'
};

const weekdayLabels = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function BatchShiftForm({ currentMonth, onClose }: BatchShiftFormProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createShift } = useShifts();

  const form = useForm<BatchShiftFormValues>({
    resolver: zodResolver(batchShiftSchema),
    defaultValues: {
      targetType: 'all',
      weekdays: [],
      periodType: 'month',
    },
  });

  const watchTargetType = form.watch('targetType');
  const watchShiftType = form.watch('shiftType');
  const watchPeriodType = form.watch('periodType');

  const onSubmit = async (data: BatchShiftFormValues) => {
    setIsSubmitting(true);
    try {
      // Logic for creating batch shifts will be implemented
      console.log('Batch shift data:', data, 'Selected users:', selectedUserIds);
      toast.success('Turni creati con successo');
      onClose();
    } catch (error) {
      console.error('Error creating batch shifts:', error);
      toast.error('Errore nella creazione dei turni');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Inserimento Turni in Blocco
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configura i turni per {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Target Users */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="font-medium">Destinatari</h3>
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
                <UserFilterDropdown
                  selectedUserIds={selectedUserIds}
                  onSelectUsers={setSelectedUserIds}
                  showOnlyAdminAndSocio={false}
                />
              )}
            </div>

            {/* Shift Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-medium">Tipo di Turno</h3>
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
                <div className="grid grid-cols-2 gap-4">
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
              )}
            </div>

            {/* Weekdays */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <h3 className="font-medium">Giorni della Settimana</h3>
              </div>
              
              <FormField
                control={form.control}
                name="weekdays"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-7 gap-2">
                      {weekdayLabels.map((day, index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name="weekdays"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={index}
                                className="flex flex-row items-start space-x-3 space-y-0"
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
                                <FormLabel className="text-sm font-normal">
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
              <h3 className="font-medium">Periodo di Applicazione</h3>
              
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
                <FormField
                  control={form.control}
                  name="weekNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numero settimana (1-5)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={5}
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creazione...' : 'Crea Turni'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}