
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFeedback } from '@/hooks/useFeedback';

const feedbackSchema = z.object({
  tipo: z.string().min(1, 'Seleziona il tipo di feedback'),
  pagina: z.string().min(1, 'Indica la pagina di riferimento'),
  messaggio: z.string().min(10, 'Il messaggio deve contenere almeno 10 caratteri'),
  email: z.string().email('Inserisci un email valida').optional().or(z.literal('')),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const { createFeedback, isSubmitting } = useFeedback();
  
  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      tipo: '',
      pagina: window.location.pathname,
      messaggio: '',
      email: '',
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      // Ensure all required fields are present
      const feedbackData = {
        tipo: data.tipo,
        pagina: data.pagina,
        messaggio: data.messaggio,
        email: data.email || undefined,
      };
      
      await createFeedback(feedbackData);
      onSuccess();
      form.reset();
    } catch (error) {
      console.error('Errore invio feedback:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo di Feedback</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona il tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">🐛 Bug/Errore</SelectItem>
                  <SelectItem value="feature">💡 Nuova Funzionalità</SelectItem>
                  <SelectItem value="improvement">⚡ Miglioramento</SelectItem>
                  <SelectItem value="usability">👤 Usabilità</SelectItem>
                  <SelectItem value="other">🔧 Altro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pagina"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pagina di riferimento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Es. /dashboard, /users" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="messaggio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Messaggio</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Descrivi il problema, suggerimento o commento..."
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (opzionale)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Per essere ricontattato"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Invio...' : 'Invia Feedback'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
