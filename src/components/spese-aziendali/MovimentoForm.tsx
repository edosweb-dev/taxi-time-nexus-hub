
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
import { MovimentoFormData } from '@/lib/types/spese-aziendali';

const formSchema = z.object({
  data_movimento: z.string(),
  importo: z.number().positive('L\'importo deve essere positivo'),
  tipo_causale: z.enum(['generica', 'f24', 'stipendio']).default('generica'),
  causale: z.string().min(3, 'La causale deve avere almeno 3 caratteri').max(500, 'La causale è troppo lunga'),
  modalita_pagamento_id: z.string().min(1, 'Seleziona una modalità di pagamento'),
  dipendente_id: z.string().uuid().optional(),
  note: z.string().optional(),
  is_pending: z.boolean().default(false),
}).refine(
  (data) => data.tipo_causale !== 'stipendio' || data.dipendente_id,
  { message: "Seleziona un dipendente per causale Stipendio", path: ["dipendente_id"] }
);

interface MovimentoFormProps {
  onSuccess: () => void;
  defaultTipoCausale?: 'generica' | 'f24' | 'stipendio';
}

export function MovimentoForm({ onSuccess, defaultTipoCausale }: MovimentoFormProps) {
  const { addMovimento } = useSpeseAziendali();
  const { modalitaAttive } = useModalitaPagamenti();

  // Fetch dipendenti
  const { data: dipendenti } = useQuery({
    queryKey: ['dipendenti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('role', ['dipendente', 'socio']);

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data_movimento: new Date().toISOString().split('T')[0],
      importo: 0,
      tipo_causale: defaultTipoCausale || 'generica',
      causale: '',
      modalita_pagamento_id: '',
      dipendente_id: '',
      note: '',
      is_pending: false,
    },
  });

  const tipoCausale = form.watch('tipo_causale');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData: MovimentoFormData = {
      data_movimento: values.data_movimento,
      importo: values.importo,
      causale: values.causale,
      tipologia: 'spesa', // SEMPRE spesa per movimenti manuali
      tipo_causale: values.tipo_causale || 'generica',
      modalita_pagamento_id: values.modalita_pagamento_id,
      dipendente_id: values.tipo_causale === 'stipendio' ? values.dipendente_id : undefined,
      note: values.note || undefined,
      stato_pagamento: values.is_pending ? 'pending' : 'completato',
    };

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
          name="tipo_causale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo Causale</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'generica'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="generica">💳 Spesa Generica</SelectItem>
                  <SelectItem value="f24">📄 F24 (Tasse/Contributi)</SelectItem>
                  <SelectItem value="stipendio">💰 Stipendio Dipendente</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tipoCausale === 'stipendio' && (
          <FormField
            control={form.control}
            name="dipendente_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dipendente *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona dipendente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dipendenti
                      ?.filter(d => d.role === 'dipendente' || d.role === 'socio')
                      .map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.first_name} {d.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground mt-2">
                  Questo movimento apparirà nello storico stipendi del dipendente
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
