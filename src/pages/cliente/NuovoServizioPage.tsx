import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, User, FileText, Send, Loader2 } from 'lucide-react';

const formSchema = z.object({
  // Campi servizio
  data_servizio: z.string().min(1, "Data obbligatoria"),
  orario_servizio: z.string().min(1, "Orario obbligatorio"),
  citta_presa: z.string().optional(),
  indirizzo_presa: z.string().min(5, "Indirizzo partenza obbligatorio (min 5 caratteri)"),
  citta_destinazione: z.string().optional(),
  indirizzo_destinazione: z.string().min(5, "Indirizzo arrivo obbligatorio (min 5 caratteri)"),
  numero_commessa: z.string().optional(),
  note: z.string().optional(),
  
  // Gestione passeggero (modalità esistente)
  passeggero_esistente_id: z.string().optional(),
  
  // Gestione passeggero (modalità nuovo)
  passeggero_nome: z.string().optional(),
  passeggero_email: z.string().email("Email non valida").optional().or(z.literal("")),
  passeggero_telefono: z.string().optional(),
}).refine(
  (data) => {
    // Validazione: deve avere almeno passeggero_esistente_id O passeggero_nome
    return data.passeggero_esistente_id || data.passeggero_nome;
  },
  {
    message: "Seleziona un passeggero dalla rubrica o creane uno nuovo",
    path: ["passeggero_esistente_id"],
  }
);

export default function NuovoServizioPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalitaPasseggero, setModalitaPasseggero] = useState<"esistente" | "nuovo">("esistente");

  // Query profilo utente corrente
  const { data: currentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["current-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, azienda_id, first_name, last_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (!data.azienda_id) throw new Error("Profilo non associato a un'azienda");
      
      return data;
    },
  });

  // Query passeggeri dalla rubrica
  const { data: passeggeri = [], isLoading: isLoadingPasseggeri } = useQuery({
    queryKey: ["passeggeri-cliente", currentProfile?.id],
    queryFn: async () => {
      if (!currentProfile?.id) return [];

      const { data, error } = await supabase
        .from("passeggeri")
        .select("id, nome_cognome, email, telefono")
        .eq("created_by_referente_id", currentProfile.id)
        .eq("tipo", "rubrica")
        .order("nome_cognome", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentProfile?.id,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data_servizio: new Date().toISOString().split('T')[0],
      orario_servizio: new Date().toTimeString().slice(0, 5),
      citta_presa: "",
      indirizzo_presa: "",
      citta_destinazione: "",
      indirizzo_destinazione: "",
      numero_commessa: "",
      note: "",
      passeggero_esistente_id: "",
      passeggero_nome: "",
      passeggero_email: "",
      passeggero_telefono: "",
    },
  });

  // Mutation per creare servizio
  const createServizio = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentProfile) throw new Error("Utente non autenticato");

      let passeggeroId: string;

      // STEP 1: Determina passeggero_id
      if (modalitaPasseggero === "esistente" && values.passeggero_esistente_id) {
        passeggeroId = values.passeggero_esistente_id;
        console.log("✅ Uso passeggero esistente:", passeggeroId);
      } else if (modalitaPasseggero === "nuovo" && values.passeggero_nome) {
        // Crea nuovo passeggero (PERMANENTE)
        const { data: nuovoPasseggero, error: passeggeroError } = await supabase
          .from("passeggeri")
          .insert({
            nome_cognome: values.passeggero_nome,
            email: values.passeggero_email || null,
            telefono: values.passeggero_telefono || null,
            azienda_id: currentProfile.azienda_id,
            referente_id: user.id,
          })
          .select()
          .single();

        if (passeggeroError) throw passeggeroError;
        passeggeroId = nuovoPasseggero.id;
        console.log("✅ Nuovo passeggero creato:", nuovoPasseggero);
      } else {
        throw new Error("Nessun passeggero selezionato o creato");
      }

      // STEP 2: Crea servizio
      const { data: servizio, error: servizioError } = await supabase
        .from("servizi")
        .insert({
          tipo_cliente: "azienda",
          azienda_id: currentProfile.azienda_id,
          referente_id: user.id,
          created_by: user.id,
          data_servizio: values.data_servizio,
          orario_servizio: values.orario_servizio,
          citta_presa: values.citta_presa || null,
          indirizzo_presa: values.indirizzo_presa,
          citta_destinazione: values.citta_destinazione || null,
          indirizzo_destinazione: values.indirizzo_destinazione,
          numero_commessa: values.numero_commessa || null,
          note: values.note || null,
          stato: "da_assegnare",
          metodo_pagamento: "Da definire",
        })
        .select()
        .single();

      if (servizioError) throw servizioError;
      console.log("✅ Servizio creato:", servizio);

      // STEP 3: Associa passeggero a servizio
      const { error: associazioneError } = await supabase
        .from("servizi_passeggeri")
        .insert({
          servizio_id: servizio.id,
          passeggero_id: passeggeroId,
        });

      if (associazioneError) throw associazioneError;
      console.log("✅ Passeggero associato a servizio");

      return servizio;
    },
    onSuccess: (servizio) => {
      queryClient.invalidateQueries({ queryKey: ["servizi-cliente"] });
      queryClient.invalidateQueries({ queryKey: ["passeggeri-cliente"] });
      
      toast({
        title: "✅ Servizio richiesto",
        description: "Reindirizzamento alla conferma...",
      });
      
      setTimeout(() => {
        navigate(`/dashboard-cliente/servizio-confermato?id=${servizio.id}`);
      }, 500);
    },
    onError: (error: Error) => {
      console.error("❌ Errore creazione servizio:", error);
      toast({
        title: "❌ Errore",
        description: error.message || "Impossibile creare il servizio",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createServizio.mutate(values);
  };

  return (
    <MainLayout>
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
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* SEZIONE: Quando */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Quando
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="data_servizio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Servizio *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="orario_servizio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orario *</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* SEZIONE: Dove */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Dove
                  </h3>

                  {/* Partenza */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Partenza</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="citta_presa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Città</FormLabel>
                            <FormControl>
                              <Input placeholder="Milano" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="indirizzo_presa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Indirizzo di Presa *</FormLabel>
                            <FormControl>
                              <Input placeholder="Via Roma 123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Destinazione */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Destinazione</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="citta_destinazione"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Città</FormLabel>
                            <FormControl>
                              <Input placeholder="Ferno" {...field} />
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
                            <FormLabel>Indirizzo di Destinazione *</FormLabel>
                            <FormControl>
                              <Input placeholder="Aeroporto Malpensa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* SEZIONE: Passeggero (HYBRID) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Passeggero
                  </h3>

                  {/* Radio Group: Esistente o Nuovo */}
                  <RadioGroup
                    value={modalitaPasseggero}
                    onValueChange={(value) => {
                      setModalitaPasseggero(value as "esistente" | "nuovo");
                      // Reset campi quando si cambia modalità
                      if (value === "esistente") {
                        form.setValue("passeggero_nome", "");
                        form.setValue("passeggero_email", "");
                        form.setValue("passeggero_telefono", "");
                      } else {
                        form.setValue("passeggero_esistente_id", "");
                      }
                    }}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="esistente" id="esistente" />
                      <Label htmlFor="esistente" className="cursor-pointer">
                        Seleziona dalla rubrica
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nuovo" id="nuovo" />
                      <Label htmlFor="nuovo" className="cursor-pointer">
                        Aggiungi nuovo passeggero
                      </Label>
                    </div>
                  </RadioGroup>

                  {/* Opzione A: Dropdown Passeggero Esistente */}
                  {modalitaPasseggero === "esistente" && (
                    <FormField
                      control={form.control}
                      name="passeggero_esistente_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passeggero *</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={isLoadingPasseggeri}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  isLoadingPasseggeri 
                                    ? "Caricamento..." 
                                    : passeggeri.length === 0
                                      ? "Nessun passeggero in rubrica"
                                      : "Seleziona passeggero"
                                } />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {passeggeri.length > 0 ? (
                                passeggeri.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.nome_cognome}
                                    {p.email && ` • ${p.email}`}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="empty" disabled>
                                  Nessun passeggero disponibile
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {passeggeri.length === 0 && !isLoadingPasseggeri && (
                            <FormDescription className="text-sm text-muted-foreground">
                              Non hai ancora creato passeggeri. Seleziona "Aggiungi nuovo passeggero" oppure{" "}
                              <a 
                                href="/dashboard-cliente/passeggeri" 
                                target="_blank"
                                className="text-primary hover:underline"
                              >
                                vai alla rubrica
                              </a>
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Opzione B: Form Inline Nuovo Passeggero */}
                  {modalitaPasseggero === "nuovo" && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground">
                        Il passeggero verrà salvato nella tua rubrica e potrai riutilizzarlo per servizi futuri.
                      </p>
                      
                      <FormField
                        control={form.control}
                        name="passeggero_nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome e Cognome *</FormLabel>
                            <FormControl>
                              <Input placeholder="Mario Rossi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="passeggero_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="mario@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="passeggero_telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefono</FormLabel>
                              <FormControl>
                                <Input placeholder="+39 123 456 7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* SEZIONE: Info Aggiuntive */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Informazioni Aggiuntive
                  </h3>

                  <FormField
                    control={form.control}
                    name="numero_commessa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numero Commessa</FormLabel>
                        <FormControl>
                          <Input placeholder="COM-2025-001" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Opzionale - Inserisci il numero di commessa se disponibile
                        </FormDescription>
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
                          <Textarea
                            placeholder="Eventuali note o richieste particolari..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={createServizio.isPending || isLoadingProfile}
                >
                  {createServizio.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Invio richiesta...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Richiedi Servizio
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
