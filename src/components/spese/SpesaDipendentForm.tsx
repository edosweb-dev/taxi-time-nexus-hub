
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Euro } from 'lucide-react';
import { useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';

const spesaSchema = z.object({
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
    .optional()
});

type SpesaFormData = z.infer<typeof spesaSchema>;

export function SpesaDipendentForm() {
  const { addSpesa, isAddingSpesa } = useSpeseDipendenti();

  const form = useForm<SpesaFormData>({
    resolver: zodResolver(spesaSchema),
    defaultValues: {
      importo: undefined,
      causale: '',
      note: ''
    }
  });

  const onSubmit = (data: SpesaFormData) => {
    addSpesa(data, {
      onSuccess: () => {
        form.reset();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Inserisci Nuova Spesa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="importo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importo *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Euro className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className="pl-10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                  <FormLabel>Causale *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descrizione della spesa..."
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
                  <FormLabel>Note (opzionale)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Note aggiuntive..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isAddingSpesa} className="w-full">
              {isAddingSpesa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aggiungi Spesa
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
