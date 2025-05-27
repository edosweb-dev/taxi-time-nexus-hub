
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Plus } from 'lucide-react';
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
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SpesaFormData>({
    resolver: zodResolver(spesaSchema),
    defaultValues: {
      importo: 0,
      causale: '',
      note: ''
    }
  });

  const formatCurrency = (value: string) => {
    // Rimuove tutti i caratteri non numerici eccetto virgola e punto
    const numericValue = value.replace(/[^\d.,]/g, '');
    
    // Converte virgola in punto per il parsing
    const parsedValue = parseFloat(numericValue.replace(',', '.'));
    
    if (isNaN(parsedValue)) return '';
    
    // Formatta con separatore delle migliaia
    return new Intl.NumberFormat('it-IT', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(parsedValue);
  };

  const onSubmit = (data: SpesaFormData) => {
    if (data.importo && data.causale) {
      addSpesa({
        importo: data.importo,
        causale: data.causale,
        note: data.note || undefined
      }, {
        onSuccess: () => {
          form.reset({
            importo: 0,
            causale: '',
            note: ''
          });
          
          // Feedback visivo di successo
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 2000);
        }
      });
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          Inserisci Nuova Spesa
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Aggiungi una nuova spesa al tuo registro personale
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        className={`pl-10 h-14 text-xl font-medium border-2 transition-all duration-200 ${
                          isSuccess ? 'border-green-500 bg-green-50' : 'border-gray-200 focus:border-primary'
                        }`}
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
                      className={`h-12 border-2 transition-all duration-200 ${
                        isSuccess ? 'border-green-500 bg-green-50' : 'border-gray-200 focus:border-primary'
                      }`}
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
                      className={`resize-none border-2 transition-all duration-200 ${
                        isSuccess ? 'border-green-500 bg-green-50' : 'border-gray-200 focus:border-primary'
                      }`}
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
              disabled={isAddingSpesa} 
              className="w-auto px-8 h-12 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              {isAddingSpesa ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Plus className="mr-2 h-5 w-5" />
              )}
              {isAddingSpesa ? 'Aggiungendo...' : 'Aggiungi Spesa'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
