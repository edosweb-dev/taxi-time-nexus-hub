
import React from 'react';
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

  const isAdminOrSocio = ['admin', 'socio'].includes(profile?.role || '');

  const form = useForm<SpesaFormData>({
    resolver: zodResolver(spesaSchema),
    defaultValues: {
      user_id: !isAdminOrSocio ? profile?.id : undefined,
      importo: 0,
      causale: '',
      note: '',
      data_spesa: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = (data: SpesaFormData) => {
    addSpesa({
      user_id: data.user_id,
      importo: data.importo,
      causale: data.causale,
      note: data.note,
      data_spesa: data.data_spesa
    }, {
      onSuccess: () => {
        form.reset();
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
                <FormLabel className="text-base font-medium">Registra spesa per *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un dipendente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {dipendenti.map((dipendente) => (
                      <SelectItem key={dipendente.id} value={dipendente.id}>
                        {dipendente.first_name} {dipendente.last_name}
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
              <FormLabel className="text-base font-medium">Data spesa *</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="h-12 border-2 border-gray-200 focus:border-primary"
                  {...field}
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
              <FormLabel className="text-base font-medium">Importo *</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg font-medium">
                    €
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="pl-10 h-14 text-xl font-medium border-2 border-gray-200 focus:border-primary"
                    {...field}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(value);
                    }}
                  />
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
              <FormLabel className="text-base font-medium">Causale *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Descrizione della spesa..."
                  className="h-12 border-2 border-gray-200 focus:border-primary"
                  {...field}
                />
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
              <FormLabel className="text-base font-medium">Note (opzionale)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Note aggiuntive..."
                  className="resize-none border-2 border-gray-200 focus:border-primary"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="submit" 
            disabled={isAddingSpesa}
            className="px-8 h-12 text-base font-medium bg-primary hover:bg-primary/90"
          >
            {isAddingSpesa ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : null}
            {isAddingSpesa ? 'Registrando...' : 'Registra spesa'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
