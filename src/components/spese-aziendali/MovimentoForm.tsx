import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';
import { useModalitaPagamenti } from '@/hooks/useModalitaPagamenti';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MovimentoFormData } from '@/lib/types/spese-aziendali';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  data_movimento: z.string(),
  importo: z.number().positive('L\'importo deve essere positivo'),
  tipologia: z.enum(['spesa', 'incasso', 'prelievo']).default('spesa'),
  tipo_causale: z.enum(['generica', 'f24', 'pagamento_fornitori', 'spese_gestione', 'multe', 'fattura_conducenti_esterni']).default('generica'),
  causale: z.string().min(3, 'La causale deve avere almeno 3 caratteri').max(500, 'La causale è troppo lunga'),
  modalita_pagamento_id: z.string().uuid({ message: 'Seleziona una modalità di pagamento' }),
  dipendente_id: z.string().uuid().optional(),
  socio_id: z.string().uuid().optional(),
  note: z.string().optional(),
  is_pending: z.boolean().default(false),
}).refine(
  (data) => data.tipologia !== 'prelievo' || data.socio_id,
  { message: "Seleziona un socio per i prelievi", path: ["socio_id"] }
);

interface MovimentoFormProps {
  onSuccess: () => void;
  defaultTipoCausale?: 'generica' | 'f24' | 'pagamento_fornitori' | 'spese_gestione' | 'multe' | 'fattura_conducenti_esterni';
}

export function MovimentoForm({ onSuccess, defaultTipoCausale }: MovimentoFormProps) {
  const { addMovimento } = useSpeseAziendali();
  const { modalitaAttive } = useModalitaPagamenti();
  const { toast } = useToast();

  // Fetch dipendenti
  const { data: dipendenti } = useQuery({
    queryKey: ['dipendenti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('role', ['dipendente', 'socio', 'admin']);

      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data_movimento: new Date().toISOString().split('T')[0],
      importo: 0,
      tipologia: 'spesa',
      tipo_causale: defaultTipoCausale || 'generica',
      causale: '',
      modalita_pagamento_id: undefined as unknown as string,
      dipendente_id: undefined,
      socio_id: undefined,
      note: '',
      is_pending: false,
    },
  });

  const tipoCausale = form.watch('tipo_causale');
  const tipologia = form.watch('tipologia');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData: MovimentoFormData = {
      data_movimento: values.data_movimento,
      importo: values.importo,
      causale: values.causale,
      tipologia: values.tipologia,
      tipo_causale: values.tipo_causale || 'generica',
      modalita_pagamento_id: values.modalita_pagamento_id,
      dipendente_id: undefined,
      socio_id: (values.tipologia === 'prelievo' || values.tipologia === 'spesa') 
        ? (values.socio_id === 'none' ? null : values.socio_id) 
        : null,
      note: values.note || undefined,
      stato_pagamento: values.is_pending ? 'pending' : 'completato',
    };

    console.log('[MovimentoForm] Submitting data:', formData);
    
    try {
      await addMovimento.mutateAsync(formData);
      onSuccess();
    } catch (error) {
      console.error('[MovimentoForm] Errore salvataggio:', error);
    }
  };

  const onError = (errors: Record<string, any>) => {
    console.error('[MovimentoForm] Errori validazione:', errors);
    const firstError = Object.values(errors)[0] as any;
    toast({
      title: "Compila tutti i campi obbligatori",
      description: firstError?.message || "Verifica i campi evidenziati",
      variant: "destructive",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
        <FormField
          control={form.control}
          name="data_movimento"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data movimento</FormLabel>
              <FormControl>
                <DatePickerField
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                  placeholder="Seleziona data"
                  disabledDates={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
              </FormControl>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg pointer-events-none z-10">
                    €
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="text-lg !pl-10"
                    value={field.value === 0 ? '' : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? 0 : parseFloat(value));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipologia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo Movimento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'spesa'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo movimento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="spesa">Spesa (uscita)</SelectItem>
                  <SelectItem value="incasso">Incasso (entrata)</SelectItem>
                  <SelectItem value="prelievo">Prelievo Socio</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tipologia === 'spesa' && (
          <FormField
            control={form.control}
            name="tipo_causale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria Spesa</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || 'generica'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="generica">Spesa Generica</SelectItem>
                    <SelectItem value="f24">F24 (Tasse/Contributi)</SelectItem>
                    <SelectItem value="pagamento_fornitori">Pagamento Fornitori</SelectItem>
                    <SelectItem value="spese_gestione">Spese di Gestione</SelectItem>
                    <SelectItem value="multe">Multe</SelectItem>
                    <SelectItem value="fattura_conducenti_esterni">Fattura Conducenti Esterni</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(tipologia === 'prelievo' || tipologia === 'spesa') && (
          <FormField
            control={form.control}
            name="socio_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {tipologia === 'prelievo' ? 'Socio che preleva *' : 'Spesa effettuata da'}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        tipologia === 'prelievo' 
                          ? "Seleziona socio che preleva" 
                          : "Chi ha effettuato questa spesa?"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tipologia === 'spesa' && (
                      <SelectItem value="none">Nessuno (spesa non attribuita)</SelectItem>
                    )}
                    {dipendenti
                      ?.filter(d => d.role === 'socio' || d.role === 'admin')
                      .map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.first_name} {d.last_name} ({d.role === 'admin' ? 'Admin' : 'Socio'})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground mt-2">
                  {tipologia === 'prelievo' 
                    ? "Questo prelievo apparirà nello storico del socio" 
                    : "Se specificato, la spesa apparirà nel report del socio"}
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
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    id="pagamento_pending"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5"
                  />
                </FormControl>
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="pagamento_pending" className="text-sm font-medium cursor-pointer">
                    Pagamento pending
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    Il pagamento non è ancora stato effettuato
                  </span>
                </div>
              </div>
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
