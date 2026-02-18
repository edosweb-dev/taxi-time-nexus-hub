import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, User, FileText, Send, Loader2, Plus, X, UserPlus } from 'lucide-react';

// Schema senza campi passeggero (gestiti via stato React)
const formSchema = z.object({
  data_servizio: z.string().min(1, "Data obbligatoria"),
  orario_servizio: z.string().min(1, "Orario obbligatorio"),
  citta_presa: z.string().optional(),
  indirizzo_presa: z.string().min(5, "Indirizzo partenza obbligatorio (min 5 caratteri)"),
  citta_destinazione: z.string().optional(),
  indirizzo_destinazione: z.string().min(5, "Indirizzo arrivo obbligatorio (min 5 caratteri)"),
  numero_commessa: z.string().optional(),
  note: z.string().optional(),
});

interface PasseggeroSelezionato {
  id?: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  isNew: boolean;
}

export default function NuovoServizioPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Stato passeggeri multipli
  const [passeggeriSelezionati, setPasseggeriSelezionati] = useState<PasseggeroSelezionato[]>([]);
  const [showNuovoDialog, setShowNuovoDialog] = useState(false);
  const [nuovoNome, setNuovoNome] = useState('');
  const [nuovoEmail, setNuovoEmail] = useState('');
  const [nuovoTelefono, setNuovoTelefono] = useState('');

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

  // FIX #1: Query passeggeri per azienda_id (non created_by_referente_id)
  const { data: passeggeri = [], isLoading: isLoadingPasseggeri } = useQuery({
    queryKey: ["passeggeri-cliente", currentProfile?.azienda_id],
    queryFn: async () => {
      if (!currentProfile?.azienda_id) return [];

      const { data, error } = await supabase
        .from("passeggeri")
        .select("id, nome_cognome, email, telefono")
        .eq("azienda_id", currentProfile.azienda_id)
        .eq("tipo", "rubrica")
        .order("nome_cognome", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentProfile?.azienda_id,
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
    },
  });

  // Aggiungi passeggero dalla rubrica
  const aggiungiDaRubrica = (passeggeroId: string) => {
    const p = passeggeri.find(x => x.id === passeggeroId);
    if (!p) return;
    // Evita duplicati
    if (passeggeriSelezionati.some(s => s.id === p.id)) {
      toast({ title: "Passeggero già aggiunto", variant: "destructive" });
      return;
    }
    setPasseggeriSelezionati(prev => [...prev, {
      id: p.id,
      nome_cognome: p.nome_cognome,
      email: p.email || undefined,
      telefono: p.telefono || undefined,
      isNew: false,
    }]);
  };

  // Aggiungi nuovo passeggero
  const aggiungiNuovo = () => {
    if (!nuovoNome.trim()) {
      toast({ title: "Nome obbligatorio", variant: "destructive" });
      return;
    }
    setPasseggeriSelezionati(prev => [...prev, {
      nome_cognome: nuovoNome.trim(),
      email: nuovoEmail || undefined,
      telefono: nuovoTelefono || undefined,
      isNew: true,
    }]);
    setNuovoNome('');
    setNuovoEmail('');
    setNuovoTelefono('');
    setShowNuovoDialog(false);
  };

  // Rimuovi passeggero
  const rimuoviPasseggero = (index: number) => {
    setPasseggeriSelezionati(prev => prev.filter((_, i) => i !== index));
  };

  // Mutation per creare servizio
  const createServizio = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentProfile) throw new Error("Utente non autenticato");

      // Validazione passeggeri
      if (passeggeriSelezionati.length === 0) {
        throw new Error("Seleziona almeno un passeggero");
      }

      // STEP 1: Crea servizio
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
      console.log("✅ Servizio creato:", servizio.id);

      // STEP 2: Gestisci ogni passeggero
      for (const passeggero of passeggeriSelezionati) {
        let passeggeroId = passeggero.id;

        // Se nuovo, crea in tabella passeggeri
        if (passeggero.isNew) {
          const { data: nuovoPasseggero, error: passeggeroError } = await supabase
            .from("passeggeri")
            .insert({
              nome_cognome: passeggero.nome_cognome,
              email: passeggero.email || null,
              telefono: passeggero.telefono || null,
              azienda_id: currentProfile.azienda_id,
              created_by_referente_id: user.id, // FIX #2: campo corretto
              tipo: 'rubrica',
            })
            .select()
            .single();

          if (passeggeroError) throw passeggeroError;
          passeggeroId = nuovoPasseggero.id;
          console.log("✅ Nuovo passeggero creato:", passeggeroId);
        }

        // Associa passeggero a servizio
        const { error: linkError } = await supabase
          .from("servizi_passeggeri")
          .insert({
            servizio_id: servizio.id,
            passeggero_id: passeggeroId,
            usa_indirizzo_personalizzato: false,
          });

        if (linkError) throw linkError;
        console.log("✅ Passeggero associato:", passeggeroId);
      }

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
    if (passeggeriSelezionati.length === 0) {
      toast({ title: "Seleziona almeno un passeggero", variant: "destructive" });
      return;
    }
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

                {/* SEZIONE: Passeggeri (MULTIPLI) */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Passeggeri
                  </h3>

                  {/* Lista passeggeri aggiunti */}
                  {passeggeriSelezionati.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Passeggeri selezionati ({passeggeriSelezionati.length})
                      </Label>
                      <div className="space-y-2">
                        {passeggeriSelezionati.map((p, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{p.nome_cognome}</span>
                              {p.telefono && <span className="text-xs text-muted-foreground">• {p.telefono}</span>}
                              {p.isNew && <Badge variant="secondary" className="text-xs">Nuovo</Badge>}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => rimuoviPasseggero(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aggiungi dalla rubrica */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Aggiungi dalla rubrica</Label>
                    <Select
                      onValueChange={aggiungiDaRubrica}
                      value=""
                      disabled={isLoadingPasseggeri}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingPasseggeri 
                            ? "Caricamento..." 
                            : passeggeri.length === 0
                              ? "Nessun passeggero in rubrica"
                              : "Seleziona passeggero da aggiungere"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {passeggeri.length > 0 ? (
                          passeggeri
                            .filter(p => !passeggeriSelezionati.some(s => s.id === p.id))
                            .map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.nome_cognome}
                                {p.telefono && ` • ${p.telefono}`}
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
                        Non hai ancora passeggeri in rubrica.{" "}
                        <a 
                          href="/dashboard-cliente/passeggeri" 
                          target="_blank"
                          className="text-primary hover:underline"
                        >
                          Vai alla rubrica
                        </a>
                      </FormDescription>
                    )}
                  </div>

                  {/* Bottone crea nuovo */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNuovoDialog(true)}
                    className="w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crea Nuovo Passeggero
                  </Button>

                  {/* Messaggio se nessun passeggero */}
                  {passeggeriSelezionati.length === 0 && (
                    <p className="text-sm text-destructive">
                      Seleziona almeno un passeggero dalla rubrica o creane uno nuovo
                    </p>
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
                  disabled={createServizio.isPending || isLoadingProfile || passeggeriSelezionati.length === 0}
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

      {/* Dialog Nuovo Passeggero */}
      <Dialog open={showNuovoDialog} onOpenChange={setShowNuovoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Passeggero</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome e Cognome *</Label>
              <Input
                placeholder="Mario Rossi"
                value={nuovoNome}
                onChange={(e) => setNuovoNome(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="mario@example.com"
                  value={nuovoEmail}
                  onChange={(e) => setNuovoEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Telefono</Label>
                <Input
                  placeholder="+39 123 456 7890"
                  value={nuovoTelefono}
                  onChange={(e) => setNuovoTelefono(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Il passeggero verrà salvato nella rubrica aziendale.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNuovoDialog(false)}>
              Annulla
            </Button>
            <Button onClick={aggiungiNuovo} disabled={!nuovoNome.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Aggiungi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
