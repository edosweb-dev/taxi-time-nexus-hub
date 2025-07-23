
import { ClientDashboardLayout } from '@/components/layouts/ClientDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  data: z.string().min(1, {
    message: 'La data è obbligatoria',
  }),
  ora: z.string().min(1, {
    message: 'L\'ora è obbligatoria',
  }),
  indirizzo_partenza: z.string().min(5, {
    message: 'L\'indirizzo di partenza deve contenere almeno 5 caratteri',
  }),
  indirizzo_destinazione: z.string().min(5, {
    message: 'L\'indirizzo di destinazione deve contenere almeno 5 caratteri',
  }),
  note: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NuovoServizioPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      ora: new Date().toTimeString().slice(0, 5),
      indirizzo_partenza: '',
      indirizzo_destinazione: '',
      note: '',
    },
  });

  const onSubmit = async (values: FormData) => {
    console.log('Form values:', values);
    
    // In una versione reale, qui invieresti i dati a Supabase
    toast.success('Richiesta di servizio inviata con successo!');
    
    // Redirect alla pagina dei servizi dopo un breve timeout
    setTimeout(() => {
      navigate('/dashboard-cliente/servizi');
    }, 2000);
  };

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Richiedi Nuovo Servizio</h1>
          <p className="text-muted-foreground">
            Compila il modulo per richiedere un nuovo servizio di trasporto
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dettagli del Servizio</CardTitle>
            <CardDescription>
              Inserisci le informazioni necessarie per il servizio richiesto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ora"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ora</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="indirizzo_partenza"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo di Partenza</FormLabel>
                      <FormControl>
                        <Input placeholder="Via, numero civico, città" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="indirizzo_destinazione"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo di Destinazione</FormLabel>
                      <FormControl>
                        <Input placeholder="Via, numero civico, città" {...field} />
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
                      <FormLabel>Note Aggiuntive</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Aggiungi informazioni utili come numero di passeggeri, bagagli speciali, ecc."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Richiedi Servizio
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
