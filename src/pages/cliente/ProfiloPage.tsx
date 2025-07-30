
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Azienda } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  first_name: z.string().min(2, {
    message: 'Il nome deve contenere almeno 2 caratteri',
  }),
  last_name: z.string().min(2, {
    message: 'Il cognome deve contenere almeno 2 caratteri',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function ProfiloPage() {
  const { profile, user } = useAuth();
  const [azienda, setAzienda] = useState<Azienda | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  });

  useEffect(() => {
    async function fetchAzienda() {
      if (!profile?.azienda_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('aziende')
          .select('*')
          .eq('id', profile.azienda_id)
          .single();

        if (error) {
          console.error('Error fetching company:', error);
        } else {
          setAzienda(data as Azienda);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAzienda();
    
    // Update form values when profile changes
    form.reset({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    });
  }, [profile, form]);

  const onSubmit = async (values: FormData) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Profilo aggiornato con successo!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Errore nell'aggiornamento del profilo: ${error.message || 'Si è verificato un errore'}`);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Il Mio Profilo</h1>
          <p className="text-muted-foreground">
            Gestisci i tuoi dati personali
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Personali</CardTitle>
              <CardDescription>
                Modifica i tuoi dati anagrafici
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cognome</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Salva Modifiche</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informazioni Aziendali</CardTitle>
              <CardDescription>
                Dettagli della tua azienda
              </CardDescription>
            </CardHeader>
            <CardContent>
              {azienda ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Azienda</p>
                    <p className="text-base">{azienda.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Partita IVA</p>
                    <p className="text-base">{azienda.partita_iva}</p>
                  </div>
                  {azienda.email && (
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-base">{azienda.email}</p>
                    </div>
                  )}
                  {azienda.telefono && (
                    <div>
                      <p className="text-sm font-medium">Telefono</p>
                      <p className="text-base">{azienda.telefono}</p>
                    </div>
                  )}
                  {azienda.indirizzo && (
                    <div>
                      <p className="text-sm font-medium">Indirizzo</p>
                      <p className="text-base">{azienda.indirizzo}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Firma Digitale</p>
                    <p className="text-base">{azienda.firma_digitale_attiva ? 'Attiva' : 'Non attiva'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>Nessuna azienda associata al tuo profilo.</p>
                  <p className="text-sm mt-1">Contatta l'amministratore per maggiori informazioni.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
