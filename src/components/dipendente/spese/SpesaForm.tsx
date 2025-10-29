import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { SpesaFormData } from '@/hooks/dipendente/useSpesaCRUD';
import { useEffect } from 'react';

const spesaSchema = z.object({
  dataSpesa: z.date({
    required_error: 'Data obbligatoria'
  }).max(new Date(), 'Non puoi inserire date future'),
  
  importo: z.number({
    required_error: 'Importo obbligatorio',
    invalid_type_error: 'Inserisci un numero valido'
  })
  .positive('Importo deve essere positivo')
  .max(1000, 'Importo massimo €1.000'),
  
  causale: z.string()
    .min(3, 'Causale troppo breve (min 3 caratteri)')
    .max(100, 'Causale troppo lunga (max 100 caratteri)'),
  
  note: z.string()
    .max(500, 'Note troppo lunghe (max 500 caratteri)')
    .optional()
});

interface SpesaFormProps {
  defaultValues?: Partial<SpesaFormData>;
  onSubmit: (data: SpesaFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function SpesaForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Salva'
}: SpesaFormProps) {
  const form = useForm<SpesaFormData>({
    resolver: zodResolver(spesaSchema),
    defaultValues: {
      dataSpesa: defaultValues?.dataSpesa || new Date(),
      importo: defaultValues?.importo ?? 0,
      causale: defaultValues?.causale ?? '',
      note: defaultValues?.note ?? ''
    },
    mode: 'onSubmit'
  });

  // Debug: Verifica valore data al mount
  useEffect(() => {
    console.log('[SpesaForm] Valore dataSpesa al mount:', form.getValues('dataSpesa'));
  }, []);

  const handleSubmit = async (data: SpesaFormData) => {
    await onSubmit(data);
  };

  const noteValue = form.watch('note') || '';
  const noteLength = noteValue.length;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Data Spesa */}
        <FormField
          control={form.control}
          name="dataSpesa"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Spesa *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: it })
                      ) : (
                        <span>Seleziona data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      console.log('[SpesaForm] Data selezionata:', date);
                      field.onChange(date || new Date());
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Importo */}
        <FormField
          control={form.control}
          name="importo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importo *</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Causale */}
        <FormField
          control={form.control}
          name="causale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Causale *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Es: Carburante, Parcheggio, Pedaggi..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Note */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>📄 Note (opzionali)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Aggiungi dettagli aggiuntivi..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground text-right">
                {noteLength}/500 caratteri
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Annulla
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Salvataggio...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
