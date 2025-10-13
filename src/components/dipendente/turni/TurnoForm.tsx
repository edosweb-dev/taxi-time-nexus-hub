import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TurnoFormData } from '@/hooks/dipendente/useTurnoCRUD';

const turnoSchema = z.object({
  data: z.date({
    required_error: 'Data obbligatoria'
  }),
  tipo: z.enum([
    'full_day',
    'half_day',
    'specific_hours',
    'sick_leave',
    'unavailable',
    'extra'
  ], {
    required_error: 'Tipo turno obbligatorio'
  }),
  oraInizio: z.string().optional(),
  oraFine: z.string().optional(),
  mezzaGiornata: z.enum(['morning', 'afternoon']).optional(),
  dataInizio: z.date().optional(),
  dataFine: z.date().optional(),
  note: z.string().max(200, 'Note troppo lunghe (max 200 caratteri)').optional()
})
.refine((data) => {
  if (data.tipo === 'specific_hours') {
    return data.oraInizio && data.oraFine;
  }
  return true;
}, {
  message: 'Orari obbligatori per turno ore specifiche',
  path: ['oraInizio']
})
.refine((data) => {
  if (data.tipo === 'specific_hours' && data.oraInizio && data.oraFine) {
    return data.oraFine > data.oraInizio;
  }
  return true;
}, {
  message: 'Ora fine deve essere dopo ora inizio',
  path: ['oraFine']
})
.refine((data) => {
  if (data.tipo === 'half_day') {
    return data.mezzaGiornata;
  }
  return true;
}, {
  message: 'Seleziona mattina o pomeriggio',
  path: ['mezzaGiornata']
})
.refine((data) => {
  if (data.dataInizio && data.dataFine) {
    return data.dataFine >= data.dataInizio;
  }
  return true;
}, {
  message: 'Data fine deve essere dopo data inizio',
  path: ['dataFine']
});

interface TurnoFormProps {
  defaultValues?: Partial<TurnoFormData>;
  onSubmit: (data: TurnoFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

// Generate time options (every 30 minutes)
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m of [0, 30]) {
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export function TurnoForm({ defaultValues, onSubmit, onCancel, isLoading, submitLabel = 'Salva Turno' }: TurnoFormProps) {
  const form = useForm<TurnoFormData>({
    resolver: zodResolver(turnoSchema),
    defaultValues: defaultValues || {
      tipo: 'full_day',
    },
  });

  const tipoTurno = form.watch('tipo');

  const handleSubmit = async (data: TurnoFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Data */}
        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>📅 Data *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP', { locale: it }) : 'Seleziona data'}
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

        {/* Tipo Turno */}
        <FormField
          control={form.control}
          name="tipo"
          render={({ field}) => (
            <FormItem className="space-y-3">
              <FormLabel>🕐 Tipo Turno *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full_day" id="full_day" />
                    <Label htmlFor="full_day">Turno Completo (8h)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="half_day" id="half_day" />
                    <Label htmlFor="half_day">Mezza Giornata</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific_hours" id="specific_hours" />
                    <Label htmlFor="specific_hours">Ore Specifiche</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sick_leave" id="sick_leave" />
                    <Label htmlFor="sick_leave">Malattia</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unavailable" id="unavailable" />
                    <Label htmlFor="unavailable">Non Disponibile</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="extra" id="extra" />
                    <Label htmlFor="extra">Straordinario</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional: Ore Specifiche */}
        {tipoTurno === 'specific_hours' && (
          <div className="space-y-3">
            <Label>⏰ Orario *</Label>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="oraInizio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dalle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="08:00" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_OPTIONS.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="oraFine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="16:00" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_OPTIONS.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Conditional: Mezza Giornata */}
        {tipoTurno === 'half_day' && (
          <FormField
            control={form.control}
            name="mezzaGiornata"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>🌅 Periodo *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="morning" id="morning" />
                      <Label htmlFor="morning">Mattina (8:00-12:00)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="afternoon" id="afternoon" />
                      <Label htmlFor="afternoon">Pomeriggio (12:00-16:00)</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Conditional: Multi-day period */}
        {(tipoTurno === 'sick_leave' || tipoTurno === 'unavailable' || tipoTurno === 'extra') && (
          <div className="space-y-3 border p-3 rounded-lg">
            <Label>📆 Periodo Multi-Giorno (opzionale)</Label>
            <p className="text-xs text-muted-foreground">
              Lascia vuoto per turno singolo giorno
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="dataInizio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Dal</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'dd/MM/yy', { locale: it }) : 'Data'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
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
                name="dataFine"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Al</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'dd/MM/yy', { locale: it }) : 'Data'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
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
          </div>
        )}

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>📝 Note (opzionali)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Note aggiuntive..."
                  className="resize-none"
                  rows={3}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {field.value?.length || 0}/200 caratteri
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
