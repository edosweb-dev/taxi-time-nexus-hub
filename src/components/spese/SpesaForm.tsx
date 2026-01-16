
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useSpeseDipendenti, useDipendenti } from '@/hooks/useSpeseDipendenti';
import { useAuth } from '@/contexts/AuthContext';

const spesaSchema = z.object({
  user_id: z.string().optional(),
  importo: z
    .number({ required_error: "L'importo è obbligatorio" })
    .min(0.01, "L'importo deve essere maggiore di 0")
    .max(999999.99, "L'importo è troppo elevato"),
  causale: z
    .string({ required_error: "La causale è obbligatoria" })
    .min(3, "La causale deve contenere almeno 3 caratteri")
    .max(200, "La causale non può superare i 200 caratteri"),
  note: z
    .string()
    .max(500, "Le note non possono superare i 500 caratteri")
    .optional(),
  data_spesa: z.string().optional()
});

type SpesaFormData = z.infer<typeof spesaSchema>;

interface SpesaFormProps {
  onSuccess?: () => void;
}

export function SpesaForm({ onSuccess }: SpesaFormProps) {
  const { profile } = useAuth();
  const { addSpesa, isAddingSpesa } = useSpeseDipendenti();
  const { data: dipendenti = [] } = useDipendenti();
  const [importoInput, setImportoInput] = useState('');

  const isAdminOrSocio = ['admin', 'socio'].includes(profile?.role || '');

  const form = useForm<SpesaFormData>({
    resolver: zodResolver(spesaSchema),
    defaultValues: {
      user_id: isAdminOrSocio ? '' : profile?.id,
      importo: 0,
      causale: '',
      note: '',
      data_spesa: new Date().toISOString().split('T')[0]
    }
  });

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(number)) return '';
    return number.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleImportoChange = (value: string) => {
    setImportoInput(value);
    const number = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(number)) {
      form.setValue('importo', number);
    }
  };

  const onSubmit = (data: SpesaFormData) => {
    // Ensure all required fields are present
    const submitData = {
      user_id: data.user_id,
      importo: data.importo,
      causale: data.causale,
      note: data.note,
      data_spesa: data.data_spesa
    };

    addSpesa(submitData, {
      onSuccess: () => {
        form.reset();
        setImportoInput('');
        onSuccess?.();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isAdminOrSocio && (
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registra spesa per</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona dipendente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dipendenti.map((dipendente) => (
                      <SelectItem key={dipendente.id} value={dipendente.id}>
                        {`${dipendente.first_name || ''} ${dipendente.last_name || ''}`.trim() || 'Dipendente senza nome'}
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
          name="data_spesa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data spesa</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Importo</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg pointer-events-none z-10">
                    €
                  </span>
                  <Input
                    type="text"
                    placeholder="0,00"
                    className="!pl-10 text-lg font-semibold"
                    value={importoInput}
                    onChange={(e) => handleImportoChange(e.target.value)}
                  />
                  {importoInput && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      € {formatCurrency(importoInput)}
                    </div>
                  )}
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
                <Input placeholder="Descrivi la spesa..." {...field} />
              </FormControl>
              <FormMessage />
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
                  placeholder="Aggiungi eventuali note..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isAddingSpesa}
        >
          {isAddingSpesa ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrazione in corso...
            </>
          ) : (
            'Registra spesa'
          )}
        </Button>
      </form>
    </Form>
  );
}
