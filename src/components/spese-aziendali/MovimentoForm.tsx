
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';
import { useModalitaPagamenti } from '@/hooks/useModalitaPagamenti';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  data_movimento: z.string(),
  importo: z.number().positive('L\'importo deve essere positivo'),
  causale: z.string().min(3, 'La causale deve avere almeno 3 caratteri').max(500, 'La causale è troppo lunga'),
  tipologia: z.enum(['spesa', 'incasso', 'prelievo']),
  modalita_pagamento_id: z.string().min(1, 'Seleziona una modalità di pagamento'),
  socio_id: z.string().optional(),
  note: z.string().optional(),
  is_pending: z.boolean().default(false),
});

interface MovimentoFormProps {
  onSuccess: () => void;
}

export function MovimentoForm({ onSuccess }: MovimentoFormProps) {
  const { addMovimento } = useSpeseAziendali();
  const { modalitaAttive } = useModalitaPagamenti();

  // Fetch soci
  const { data: soci } = useQuery({
    queryKey: ['soci'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'socio');

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data_movimento: new Date().toISOString().split('T')[0],
      importo: 0,
      causale: '',
      tipologia: 'spesa',
      modalita_pagamento_id: '',
      socio_id: '',
      note: '',
      is_pending: false,
    },
  });

  const tipologia = form.watch('tipologia');
  const isPending = form.watch('is_pending');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = {
      ...values,
      stato_pagamento: (values.tipologia === 'spesa' && values.is_pending) ? 'pending' as const : 'completato' as const,
    };
    delete formData.is_pending;

    await addMovimento.mutateAsync(formData);
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="data_movimento"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data movimento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "dd/MM/yyyy")
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
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="importo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importo (€)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="text-lg pl-8"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="causale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Causale</FormLabel>
              <FormControl>
                <Input placeholder="Descrivi il movimento..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipologia"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipologia</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="spesa" id="spesa" />
                    <label htmlFor="spesa" className="font-medium text-red-600">Spesa</label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="incasso" id="incasso" />
                    <label htmlFor="incasso" className="font-medium text-green-600">Incasso</label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <RadioGroupItem value="prelievo" id="prelievo" />
                    <label htmlFor="prelievo" className="font-medium text-blue-600">Prelievo</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modalita_pagamento_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalità di pagamento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona modalità" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {modalitaAttive.map((modalita) => (
                    <SelectItem key={modalita.id} value={modalita.id}>
                      {modalita.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(tipologia === 'incasso' || tipologia === 'prelievo') && (
          <FormField
            control={form.control}
            name="socio_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Movimento effettuato da</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona socio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {soci?.map((socio) => (
                      <SelectItem key={socio.id} value={socio.id}>
                        {socio.first_name} {socio.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {tipologia === 'spesa' && (
          <FormField
            control={form.control}
            name="is_pending"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Pagamento pending</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Il pagamento non è ancora stato effettuato
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (opzionale)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Note aggiuntive..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={addMovimento.isPending}>
            {addMovimento.isPending ? 'Salvataggio...' : 'Salva movimento'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
