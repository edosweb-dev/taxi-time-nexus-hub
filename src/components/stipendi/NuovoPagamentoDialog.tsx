import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { useCreatePagamento } from '@/hooks/usePagamentiStipendi';
import { useUsers } from '@/hooks/useUsers';
import { useModalitaPagamenti } from '@/hooks/useModalitaPagamenti';
import { Loader2 } from 'lucide-react';

const pagamentoSchema = z.object({
  user_id: z.string().uuid("Seleziona un dipendente"),
  mese: z.number().min(1, "Mese deve essere tra 1 e 12").max(12, "Mese deve essere tra 1 e 12"),
  anno: z.number().min(2020, "Anno minimo: 2020").max(2099, "Anno massimo: 2099"),
  importo: z.number().min(0, "Importo deve essere positivo"),
  data_pagamento: z.date({ required_error: "Seleziona data pagamento" }),
  modalita_pagamento_id: z.string().uuid("Seleziona modalità pagamento"),
  note: z.string().max(500, "Note max 500 caratteri").optional().or(z.literal('')),
});

type PagamentoFormData = z.infer<typeof pagamentoSchema>;

const MESI = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const ANNI = Array.from({ length: 80 }, (_, i) => 2020 + i);

interface NuovoPagamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NuovoPagamentoDialog({ open, onOpenChange }: NuovoPagamentoDialogProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const form = useForm<PagamentoFormData>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: {
      user_id: '',
      mese: currentMonth,
      anno: currentYear,
      importo: 0,
      data_pagamento: currentDate,
      modalita_pagamento_id: '',
      note: '',
    },
  });

  const { mutate: createPagamento, isPending } = useCreatePagamento();
  const { users: dipendenti, isLoading: isLoadingDipendenti } = useUsers({ 
    includeRoles: ['dipendente'] 
  });
  const { modalitaAttive, isLoading: isLoadingModalita } = useModalitaPagamenti();

  const selectedUserId = form.watch('user_id');

  // Auto-fill importo quando dipendente selezionato
  useEffect(() => {
    if (selectedUserId) {
      const dipendente = dipendenti.find(d => d.id === selectedUserId);
      if ((dipendente as any)?.stipendio_fisso) {
        form.setValue('importo', Number((dipendente as any).stipendio_fisso));
      }
    }
  }, [selectedUserId, dipendenti, form]);

  const onSubmit = (data: PagamentoFormData) => {
    createPagamento(
      {
        user_id: data.user_id,
        mese: data.mese,
        anno: data.anno,
        importo: data.importo,
        data_pagamento: data.data_pagamento.toISOString().split('T')[0],
        modalita_pagamento_id: data.modalita_pagamento_id,
        note: data.note || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuovo Pagamento Stipendio</DialogTitle>
          <DialogDescription>
            Registra il pagamento dello stipendio mensile di un dipendente
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Dipendente */}
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dipendente *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingDipendenti}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona dipendente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dipendenti.map((dip) => (
                        <SelectItem key={dip.id} value={dip.id}>
                          {dip.first_name} {dip.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mese + Anno */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mese"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mese *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MESI.map((nome, index) => (
                          <SelectItem key={index} value={(index + 1).toString()}>
                            {nome}
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
                name="anno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anno *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ANNI.map((anno) => (
                          <SelectItem key={anno} value={anno.toString()}>
                            {anno}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Importo + Data Pagamento */}
            <div className="grid grid-cols-2 gap-4">
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
                          step="50"
                          min="0"
                          className="pl-8"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_pagamento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Pagamento *</FormLabel>
                    <FormControl>
                      <DatePickerField
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Seleziona data"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Modalità Pagamento */}
            <FormField
              control={form.control}
              name="modalita_pagamento_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modalità Pagamento *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingModalita}
                  >
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

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note aggiuntive..."
                      maxLength={500}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Annulla
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salva Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
