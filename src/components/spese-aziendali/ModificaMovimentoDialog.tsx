import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';
import { useModalitaPagamenti } from '@/hooks/useModalitaPagamenti';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  data_movimento: z.string(),
  importo: z.number().positive('L\'importo deve essere positivo'),
  tipologia: z.enum(['spesa', 'incasso', 'prelievo', 'versamento']),
  tipo_causale: z.enum(['generica', 'f24', 'pagamento_fornitori', 'spese_gestione', 'multe', 'fattura_conducenti_esterni']).optional(),
  causale: z.string().min(3, 'La causale deve avere almeno 3 caratteri'),
  modalita_pagamento_id: z.string().uuid(),
  socio_id: z.string().optional(),
  note: z.string().optional(),
});

interface ModificaMovimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimento: any;
}

export function ModificaMovimentoDialog({ open, onOpenChange, movimento }: ModificaMovimentoDialogProps) {
  const { updateMovimento } = useSpeseAziendali();
  const { modalitaAttive } = useModalitaPagamenti();

  const { data: soci } = useQuery({
    queryKey: ['soci-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('role', ['socio', 'admin']);
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data_movimento: movimento?.data_movimento || '',
      importo: movimento?.importo || 0,
      tipologia: movimento?.tipologia || 'spesa',
      tipo_causale: movimento?.tipo_causale || 'generica',
      causale: movimento?.causale || '',
      modalita_pagamento_id: movimento?.modalita_pagamento_id || '',
      socio_id: movimento?.socio_id || '',
      note: movimento?.note || '',
    },
  });

  React.useEffect(() => {
    if (movimento) {
      form.reset({
        data_movimento: movimento.data_movimento,
        importo: Number(movimento.importo),
        tipologia: movimento.tipologia,
        tipo_causale: movimento.tipo_causale || 'generica',
        causale: movimento.causale,
        modalita_pagamento_id: movimento.modalita_pagamento_id,
        socio_id: movimento.socio_id || '',
        note: movimento.note || '',
      });
    }
  }, [movimento, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!movimento?.id) return;
    
    await updateMovimento.mutateAsync({
      id: movimento.id,
      data: {
        data_movimento: values.data_movimento,
        importo: values.importo,
        tipologia: values.tipologia,
        tipo_causale: values.tipo_causale,
        causale: values.causale,
        modalita_pagamento_id: values.modalita_pagamento_id,
        socio_id: values.socio_id || null,
        note: values.note || null,
      },
    });
    onOpenChange(false);
  };

  const tipologia = form.watch('tipologia');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifica Movimento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="data_movimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                      placeholder="Seleziona data"
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
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
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
                  <FormLabel>Tipologia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="spesa">Spesa</SelectItem>
                      <SelectItem value="incasso">Incasso</SelectItem>
                      <SelectItem value="prelievo">Prelievo</SelectItem>
                      <SelectItem value="versamento">Versamento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(tipologia === 'prelievo' || tipologia === 'versamento' || tipologia === 'spesa') && (
              <FormField
                control={form.control}
                name="socio_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Socio</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona socio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nessuno</SelectItem>
                        {soci?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.first_name} {s.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Input {...field} />
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
                  <FormLabel>Modalità Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modalitaAttive.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome}
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={updateMovimento.isPending}>
                {updateMovimento.isPending ? 'Salvataggio...' : 'Salva'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
