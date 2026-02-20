import { useState } from 'react';
import { PasseggeroClienteCard, PasseggeroClienteData } from '@/components/servizi/passeggeri/PasseggeroClienteCard';
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
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, User, FileText, Send, Loader2, Plus, X, UserPlus, Mail, Trash2, Users, Search, Info } from 'lucide-react';
import { useEmailNotifiche } from '@/hooks/useEmailNotifiche';

// Schema senza campi passeggero (gestiti via stato React)
const formSchema = z.object({
  data_servizio: z.string().min(1, "Data obbligatoria"),
  orario_servizio: z.string().min(1, "Orario obbligatorio"),
  citta_presa: z.string().optional(),
  indirizzo_presa: z.string().optional().default(''),
  citta_destinazione: z.string().optional(),
  indirizzo_destinazione: z.string().optional().default(''),
  numero_commessa: z.string().optional(),
  note: z.string().optional(),
});

type PasseggeroSelezionato = PasseggeroClienteData;

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
  const [salvaInRubrica, setSalvaInRubrica] = useState(true);

  // (Dialog configurazione percorso rimosso - ora inline)

  // Email notifiche state
  const [emailNotificheIds, setEmailNotificheIds] = useState<string[]>([]);

  // Usa profilo da useAuth (supporta impersonificazione)
  const { profile: authProfile } = useAuth();

  // Query profilo utente corrente (o impersonificato)
  const { data: currentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["current-profile-cliente", authProfile?.id],
    queryFn: async () => {
      if (!authProfile?.id) throw new Error("Utente non autenticato");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, azienda_id, first_name, last_name")
        .eq("id", authProfile.id)
        .single();

      if (error) throw error;
      if (!data.azienda_id) throw new Error("Profilo non associato a un'azienda");
      
      return data;
    },
    enabled: !!authProfile?.id,
  });

  // Query provvigione azienda cliente
  const { data: aziendaCliente } = useQuery({
    queryKey: ['azienda-cliente-provvigione', currentProfile?.azienda_id],
    queryFn: async () => {
      if (!currentProfile?.azienda_id) return null;
      const { data, error } = await supabase
        .from('aziende')
        .select('provvigione, provvigione_valore')
        .eq('id', currentProfile.azienda_id)
        .single();
      if (error) {
        console.error('Errore caricamento provvigione azienda:', error);
        return null;
      }
      return data;
    },
    enabled: !!currentProfile?.azienda_id,
  });

  // FIX #1: Query passeggeri per azienda_id (non created_by_referente_id)
  const { data: passeggeri = [], isLoading: isLoadingPasseggeri } = useQuery({
    queryKey: ["passeggeri-cliente", currentProfile?.azienda_id],
    queryFn: async () => {
      if (!currentProfile?.azienda_id) return [];

      const { data, error } = await supabase
        .from("passeggeri")
        .select("id, nome_cognome, email, telefono, indirizzo, localita")
        .eq("azienda_id", currentProfile.azienda_id)
        .eq("tipo", "rubrica")
        .order("nome_cognome", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentProfile?.azienda_id,
  });

  // Email notifiche hook
  const { emailNotifiche, createEmailNotifica, deleteEmailNotifica, isCreating: isCreatingEmail } = useEmailNotifiche(currentProfile?.azienda_id);

  const handleEmailToggle = (emailId: string, checked: boolean) => {
    if (checked) {
      setEmailNotificheIds(prev => [...prev, emailId]);
    } else {
      setEmailNotificheIds(prev => prev.filter(id => id !== emailId));
    }
  };

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

  // Aggiungi passeggero dalla rubrica e apri config dialog
  const aggiungiDaRubrica = (passeggeroId: string) => {
    const p = passeggeri.find(x => x.id === passeggeroId);
    if (!p) return;
    if (passeggeriSelezionati.some(s => s.id === p.id)) {
      toast({ title: "Passeggero già aggiunto", variant: "destructive" });
      return;
    }
    const newIndex = passeggeriSelezionati.length;
    setPasseggeriSelezionati(prev => [...prev, {
      id: p.id,
      nome_cognome: p.nome_cognome,
      email: p.email || undefined,
      telefono: p.telefono || undefined,
      indirizzo: (p as any).indirizzo || undefined,
      localita: (p as any).localita || undefined,
      isNew: false,
      _presa_tipo: (p as any).indirizzo ? 'passeggero' : 'personalizzato',
      _destinazione_tipo: 'personalizzato',
      _usa_orario_servizio: passeggeriSelezionati.length === 0,
    }]);
    toast({ title: `✅ ${p.nome_cognome} aggiunto` });
  };

  // Aggiungi nuovo passeggero e apri config dialog
  const aggiungiNuovo = () => {
    if (!nuovoNome.trim()) {
      toast({ title: "Nome obbligatorio", variant: "destructive" });
      return;
    }
    const newIndex = passeggeriSelezionati.length;
    setPasseggeriSelezionati(prev => [...prev, {
      nome_cognome: nuovoNome.trim(),
      email: nuovoEmail || undefined,
      telefono: nuovoTelefono || undefined,
      isNew: true,
      isTemporary: !salvaInRubrica,
      _presa_tipo: 'personalizzato',
      _destinazione_tipo: 'personalizzato',
      _usa_orario_servizio: passeggeriSelezionati.length === 0,
    }]);
    setNuovoNome('');
    setNuovoEmail('');
    setNuovoTelefono('');
    setSalvaInRubrica(true);
    setShowNuovoDialog(false);
    toast({ title: `✅ ${nuovoNome.trim()} aggiunto` });
  };

  const rimuoviPasseggero = (index: number) => {
    setPasseggeriSelezionati(prev => prev.filter((_, i) => i !== index));
  };

  const handleMovePasseggero = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= passeggeriSelezionati.length) return;
    const newPasseggeri = [...passeggeriSelezionati];
    [newPasseggeri[fromIndex], newPasseggeri[toIndex]] = [newPasseggeri[toIndex], newPasseggeri[fromIndex]];
    setPasseggeriSelezionati(newPasseggeri);
  };

  // Handle config dialog confirm
  // (handleConfigConfirm rimosso - configurazione ora inline)

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
          stato: "richiesta_cliente",
          metodo_pagamento: "Da definire",
          applica_provvigione: aziendaCliente?.provvigione === true,
        })
        .select()
        .single();

      if (servizioError) throw servizioError;
      console.log("✅ Servizio creato:", servizio.id);

      // STEP 2: Gestisci ogni passeggero
      for (let pIdx = 0; pIdx < passeggeriSelezionati.length; pIdx++) {
        const passeggero = passeggeriSelezionati[pIdx];
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
              created_by_referente_id: user.id,
              tipo: passeggero.isTemporary ? 'guest' : 'rubrica',
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
            usa_indirizzo_personalizzato: passeggero.usa_indirizzo_personalizzato || false,
            luogo_presa_personalizzato: passeggero.luogo_presa_personalizzato || null,
            localita_presa_personalizzato: passeggero.localita_presa_personalizzato || null,
            orario_presa_personalizzato: passeggero.orario_presa_personalizzato || null,
            destinazione_personalizzato: passeggero.destinazione_personalizzato || null,
            localita_destinazione_personalizzato: passeggero.localita_destinazione_personalizzato || null,
            ordine_presa: pIdx + 1,
          });

        if (linkError) throw linkError;
        console.log("✅ Passeggero associato:", passeggeroId);
      }

      // STEP 3: Inserimento email notifiche
      if (emailNotificheIds.length > 0) {
        const emailData = emailNotificheIds.map(emailId => ({
          servizio_id: servizio.id,
          email_notifica_id: emailId,
        }));
        
        const { error: emailError } = await supabase
          .from("servizi_email_notifiche")
          .insert(emailData);
        
        if (emailError) {
          console.error("[NuovoServizioPage] Errore email notifiche:", emailError);
        } else {
          console.log("✅ Email notifiche collegate:", emailNotificheIds.length);
        }
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

    // Pre-popola indirizzi dal primo passeggero
    if (passeggeriSelezionati.length > 0) {
      const primo = passeggeriSelezionati[0];
      
      if (primo._presa_tipo === 'personalizzato') {
        values.indirizzo_presa = primo.luogo_presa_personalizzato || '';
        values.citta_presa = primo.localita_presa_personalizzato || undefined;
      } else if (primo._presa_tipo === 'passeggero') {
        values.indirizzo_presa = primo.indirizzo || '';
        values.citta_presa = primo.localita || undefined;
      }
      
      if (primo._destinazione_tipo === 'personalizzato') {
        values.indirizzo_destinazione = primo.destinazione_personalizzato || '';
        values.citta_destinazione = primo.localita_destinazione_personalizzato || undefined;
      } else if (primo._destinazione_tipo === 'passeggero') {
        values.indirizzo_destinazione = primo.indirizzo || '';
        values.citta_destinazione = primo.localita || undefined;
      }
      
      console.log('[Submit Cliente] Indirizzi popolati dal primo passeggero:', {
        presa: values.indirizzo_presa,
        destinazione: values.indirizzo_destinazione,
      });
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

                {/* SEZIONE: Passeggeri */}
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
                      <div className="space-y-3">
                        {passeggeriSelezionati.map((p, index) => (
                          <PasseggeroClienteCard
                            key={`${p.id || p.nome_cognome}-${index}`}
                            passeggero={p}
                            index={index}
                            totalCount={passeggeriSelezionati.length}
                            primoPasseggero={index > 0 ? passeggeriSelezionati[0] : undefined}
                            orarioServizio={form.watch('orario_servizio') || ''}
                            onRemove={() => rimuoviPasseggero(index)}
                            onMoveUp={() => handleMovePasseggero(index, 'up')}
                            onMoveDown={() => handleMovePasseggero(index, 'down')}
                            onChange={(updated) => {
                              setPasseggeriSelezionati(prev => {
                                const newList = [...prev];
                                newList[index] = updated;
                                return newList;
                              });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aggiungi dalla rubrica */}
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-5 pb-4 space-y-4">
                      {/* Header con icona e titolo */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 shrink-0">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Aggiungi dalla rubrica</p>
                          <p className="text-xs text-muted-foreground">
                            Seleziona passeggeri già salvati nella rubrica aziendale
                          </p>
                        </div>
                      </div>

                      {/* Select migliorato */}
                      <Select
                        onValueChange={aggiungiDaRubrica}
                        value=""
                        disabled={isLoadingPasseggeri}
                      >
                        <SelectTrigger className="bg-background">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Search className="h-4 w-4 shrink-0" />
                            <span>
                              {isLoadingPasseggeri
                                ? "Caricamento..."
                                : passeggeri.length === 0
                                  ? "Nessun passeggero in rubrica"
                                  : "Cerca per nome, email o località..."}
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {passeggeri.length > 0 ? (
                            passeggeri
                              .filter(p => !passeggeriSelezionati.some(s => s.id === p.id))
                              .map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  <div className="flex flex-col">
                                    <span>{p.nome_cognome}</span>
                                    {(p.localita || p.email) && (
                                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                                        {p.localita && (
                                          <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {p.localita}
                                          </span>
                                        )}
                                        {p.email && (
                                          <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {p.email}
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              Nessun passeggero disponibile
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>

                      {/* Helper text con conteggio */}
                      {passeggeri && passeggeri.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Info className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {passeggeri.filter(p => !passeggeriSelezionati.some(s => s.id === p.id)).length} passeggeri disponibili
                          </span>
                        </div>
                      )}

                      {passeggeri.length === 0 && !isLoadingPasseggeri && (
                        <p className="text-xs text-muted-foreground">
                          Non hai ancora passeggeri in rubrica.{" "}
                          <a
                            href="/dashboard-cliente/passeggeri"
                            target="_blank"
                            className="text-primary hover:underline"
                          >
                            Vai alla rubrica
                          </a>
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Bottone crea nuovo */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNuovoDialog(true)}
                    className="w-full h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    <span className="font-medium">Crea Nuovo Passeggero</span>
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

                {/* SEZIONE: Email Notifiche */}
                {currentProfile?.azienda_id && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Mail className="h-5 w-5 text-primary" />
                          Email Notifiche
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Seleziona le email che riceveranno la notifica quando il servizio viene confermato
                      </p>

                      {emailNotifiche.length === 0 ? (
                        <div className="text-center py-4 text-muted-foreground border rounded-lg">
                          <Mail className="h-6 w-6 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Nessun indirizzo email configurato</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {emailNotifiche.map((email) => (
                            <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={emailNotificheIds.includes(email.id)}
                                  onCheckedChange={(checked) => handleEmailToggle(email.id, checked as boolean)}
                                />
                                <div>
                                  <div className="font-medium text-sm">{email.nome}</div>
                                  <div className="text-xs text-muted-foreground">{email.email}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {emailNotificheIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {emailNotificheIds.length} email selezionat{emailNotificheIds.length === 1 ? 'a' : 'e'}
                        </p>
                      )}
                    </div>
                  </>
                )}

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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="salva-rubrica"
                checked={salvaInRubrica}
                onCheckedChange={(checked) => setSalvaInRubrica(checked === true)}
              />
              <Label htmlFor="salva-rubrica" className="text-sm font-normal cursor-pointer">
                Salva in rubrica aziendale
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {salvaInRubrica 
                ? "Il passeggero sarà disponibile per servizi futuri"
                : "Il passeggero sarà usato solo per questo servizio"}
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
