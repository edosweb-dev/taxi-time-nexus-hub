import { useState } from 'react';
import { PasseggeroClienteCard, PasseggeroClienteData } from '@/components/servizi/passeggeri/PasseggeroClienteCard';
import { DialogConfiguraPercorsoPasseggero, PercorsoConfig } from '@/components/servizi/passeggeri/DialogConfiguraPercorsoPasseggero';
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, MapPin, User, FileText, Send, Loader2, Plus, X, UserPlus, Mail, Trash2, Check, ChevronsUpDown, Building, UserCircle } from 'lucide-react';
import { useEmailNotifiche } from '@/hooks/useEmailNotifiche';
import { cn } from '@/lib/utils';

// Schema senza campi passeggero (gestiti via stato React)
const formSchema = z.object({
  data_servizio: z.string().min(1, "Data obbligatoria"),
  orario_servizio: z.string().min(1, "Orario obbligatorio"),
  citta_presa: z.string().optional(),
  indirizzo_presa: z.string().min(1, "Indirizzo partenza obbligatorio"),
  citta_destinazione: z.string().optional(),
  indirizzo_destinazione: z.string().min(1, "Indirizzo arrivo obbligatorio"),
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

  // Dialog configurazione percorso
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configDialogIndex, setConfigDialogIndex] = useState<number | null>(null);

  // Email notifiche state
  const [emailNotificheIds, setEmailNotificheIds] = useState<string[]>([]);

  // Tipo cliente state
  const [tipoCliente, setTipoCliente] = useState<'azienda' | 'privato'>('azienda');
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [clientiOpen, setClientiOpen] = useState(false);

  // Nuovo cliente privato fields
  const [nuovoClienteNome, setNuovoClienteNome] = useState('');
  const [nuovoClienteCognome, setNuovoClienteCognome] = useState('');
  const [nuovoClienteEmail, setNuovoClienteEmail] = useState('');
  const [nuovoClienteTelefono, setNuovoClienteTelefono] = useState('');

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

  // Clienti privati query
  const { data: clientiAnagrafica = [] } = useQuery({
    queryKey: ["clienti-privati-form"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clienti_privati')
        .select('*')
        .order('cognome', { ascending: true })
        .order('nome', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: tipoCliente === 'privato',
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

  const handleTipoChange = (tipo: 'azienda' | 'privato') => {
    setTipoCliente(tipo);
    setSelectedClienteId('');
    setNuovoClienteNome('');
    setNuovoClienteCognome('');
    setNuovoClienteEmail('');
    setNuovoClienteTelefono('');
    // Reset passeggeri when switching type
    setPasseggeriSelezionati([]);
    setEmailNotificheIds([]);
  };

  const handleSelectCliente = (clienteId: string) => {
    setSelectedClienteId(clienteId);
    if (clienteId && clienteId !== 'nuovo') {
      const cliente = clientiAnagrafica.find(c => c.id === clienteId);
      if (cliente) {
        setNuovoClienteNome(cliente.nome);
        setNuovoClienteCognome(cliente.cognome);
        setNuovoClienteEmail(cliente.email || '');
        setNuovoClienteTelefono(cliente.telefono || '');
      }
    } else if (clienteId === 'nuovo') {
      setNuovoClienteNome('');
      setNuovoClienteCognome('');
      setNuovoClienteEmail('');
      setNuovoClienteTelefono('');
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
      _presa_tipo: 'servizio',
      _destinazione_tipo: 'servizio',
      _usa_orario_servizio: true,
    }]);
    // Open config dialog for newly added passenger
    setConfigDialogIndex(newIndex);
    setConfigDialogOpen(true);
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
      _presa_tipo: 'servizio',
      _destinazione_tipo: 'servizio',
      _usa_orario_servizio: true,
    }]);
    setNuovoNome('');
    setNuovoEmail('');
    setNuovoTelefono('');
    setSalvaInRubrica(true);
    setShowNuovoDialog(false);
    // Open config dialog
    setConfigDialogIndex(newIndex);
    setConfigDialogOpen(true);
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
  const handleConfigConfirm = (config: PercorsoConfig) => {
    if (configDialogIndex === null) return;
    setPasseggeriSelezionati(prev => {
      const updated = [...prev];
      if (updated[configDialogIndex]) {
        updated[configDialogIndex] = {
          ...updated[configDialogIndex],
          _presa_tipo: config.presaTipo,
          _destinazione_tipo: config.destinazioneTipo === 'servizio' ? 'servizio' : 'personalizzato',
          _usa_orario_servizio: config.usaOrarioServizio,
          usa_indirizzo_personalizzato: config.presaTipo !== 'servizio' || config.destinazioneTipo !== 'servizio',
          luogo_presa_personalizzato: config.luogoPresa || undefined,
          localita_presa_personalizzato: config.localitaPresa || undefined,
          orario_presa_personalizzato: config.orarioPresaPersonalizzato || undefined,
          destinazione_personalizzato: config.destinazione || undefined,
          localita_destinazione_personalizzato: config.localitaDestinazione || undefined,
        };
      }
      return updated;
    });
    setConfigDialogOpen(false);
    setConfigDialogIndex(null);
  };

  // Determine if form is ready to show remaining fields
  const isClienteReady = tipoCliente === 'azienda' || 
    (tipoCliente === 'privato' && selectedClienteId !== '' && 
      (selectedClienteId !== 'nuovo' || (nuovoClienteNome.trim() && nuovoClienteCognome.trim()))
    );

  // Mutation per creare servizio
  const createServizio = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !currentProfile) throw new Error("Utente non autenticato");

      // Validazione passeggeri
      if (passeggeriSelezionati.length === 0) {
        throw new Error("Seleziona almeno un passeggero");
      }

      // Build insert data based on tipo_cliente
      const insertData: Record<string, any> = {
        created_by: user.id,
        referente_id: user.id,
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
        tipo_cliente: tipoCliente,
      };

      if (tipoCliente === 'azienda') {
        insertData.azienda_id = currentProfile.azienda_id;
      } else {
        // Cliente privato
        if (selectedClienteId && selectedClienteId !== 'nuovo') {
          insertData.cliente_privato_id = selectedClienteId;
          const cliente = clientiAnagrafica.find(c => c.id === selectedClienteId);
          insertData.cliente_privato_nome = cliente?.nome || null;
          insertData.cliente_privato_cognome = cliente?.cognome || null;
        } else {
          // Nuovo cliente - salva solo nome/cognome sul servizio
          insertData.cliente_privato_nome = nuovoClienteNome || null;
          insertData.cliente_privato_cognome = nuovoClienteCognome || null;
        }
      }

      // STEP 1: Crea servizio
      const { data: servizio, error: servizioError } = await supabase
        .from("servizi")
        .insert(insertData as any)
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
    if (tipoCliente === 'privato' && !selectedClienteId) {
      toast({ title: "Seleziona un cliente privato", variant: "destructive" });
      return;
    }
    createServizio.mutate(values);
  };

  const configPasseggero = configDialogIndex !== null ? passeggeriSelezionati[configDialogIndex] : null;

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
                
                {/* SEZIONE: Tipo Cliente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Chi richiede il servizio?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={tipoCliente === 'azienda' ? 'default' : 'outline'}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                      onClick={() => handleTipoChange('azienda')}
                    >
                      <Building className="h-5 w-5" />
                      <span className="text-sm">Azienda</span>
                    </Button>
                    <Button
                      type="button"
                      variant={tipoCliente === 'privato' ? 'default' : 'outline'}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                      onClick={() => handleTipoChange('privato')}
                    >
                      <UserCircle className="h-5 w-5" />
                      <span className="text-sm">Cliente Privato</span>
                    </Button>
                  </div>
                </div>

                {/* SEZIONE: Selezione Cliente Privato */}
                {tipoCliente === 'privato' && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-primary" />
                        Clienti in Anagrafica
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Seleziona un cliente già salvato oppure crea un nuovo cliente qui sotto
                      </p>

                      <Popover open={clientiOpen} onOpenChange={setClientiOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={clientiOpen}
                            className="w-full justify-between font-normal"
                          >
                            {selectedClienteId === "nuovo"
                              ? "✨ Nuovo cliente"
                              : selectedClienteId
                                ? (() => {
                                    const c = clientiAnagrafica.find(c => c.id === selectedClienteId);
                                    return c ? `${c.nome} ${c.cognome}` : "Seleziona cliente...";
                                  })()
                                : "Seleziona cliente..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Cerca per nome o cognome..." />
                            <CommandList>
                              <CommandEmpty>Nessun cliente trovato.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    handleSelectCliente("nuovo");
                                    setClientiOpen(false);
                                  }}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Nuovo cliente
                                </CommandItem>
                                {clientiAnagrafica.map((cliente) => (
                                  <CommandItem
                                    key={cliente.id}
                                    value={`${cliente.nome} ${cliente.cognome} ${cliente.email || ''}`}
                                    onSelect={() => {
                                      handleSelectCliente(cliente.id);
                                      setClientiOpen(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", selectedClienteId === cliente.id ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{cliente.nome} {cliente.cognome}</span>
                                      {cliente.email && (
                                        <span className="text-xs text-muted-foreground">{cliente.email}</span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Form nuovo cliente inline */}
                      {selectedClienteId === 'nuovo' && (
                        <div className="space-y-3 rounded-lg bg-primary/5 p-4 border border-primary/20">
                          <p className="text-sm font-medium">Dati nuovo cliente</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Nome *</Label>
                              <Input
                                placeholder="Mario"
                                value={nuovoClienteNome}
                                onChange={(e) => setNuovoClienteNome(e.target.value)}
                                className="bg-background"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Cognome *</Label>
                              <Input
                                placeholder="Rossi"
                                value={nuovoClienteCognome}
                                onChange={(e) => setNuovoClienteCognome(e.target.value)}
                                className="bg-background"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Email</Label>
                              <Input
                                type="email"
                                placeholder="mario@example.com"
                                value={nuovoClienteEmail}
                                onChange={(e) => setNuovoClienteEmail(e.target.value)}
                                className="bg-background"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Telefono</Label>
                              <Input
                                placeholder="+39 123 456 7890"
                                value={nuovoClienteTelefono}
                                onChange={(e) => setNuovoClienteTelefono(e.target.value)}
                                className="bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </>
                )}

                {/* SEZIONE: Quando - always for azienda, after client for privato */}
                {isClienteReady && (
                  <>
                    <Separator />
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
                  </>
                )}

                {/* SEZIONE: Dove */}
                {isClienteReady && (
                  <>
                    <Separator />
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
                  </>
                )}

                {/* SEZIONE: Passeggeri */}
                {isClienteReady && (
                  <>
                    <Separator />
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
                          {passeggeriSelezionati.length > 1 && (
                            <p className="text-xs text-muted-foreground">
                              Usa le frecce ▲▼ per riordinare la sequenza di pick-up
                            </p>
                          )}
                          <div className="space-y-3">
                            {passeggeriSelezionati.map((p, index) => (
                              <PasseggeroClienteCard
                                key={`${p.id || p.nome_cognome}-${index}`}
                                passeggero={p}
                                index={index}
                                totalCount={passeggeriSelezionati.length}
                                onRemove={() => rimuoviPasseggero(index)}
                                onConfigura={() => {
                                  setConfigDialogIndex(index);
                                  setConfigDialogOpen(true);
                                }}
                                onMoveUp={() => handleMovePasseggero(index, 'up')}
                                onMoveDown={() => handleMovePasseggero(index, 'down')}
                                indirizzoPresaServizio={form.watch('indirizzo_presa') || ''}
                                cittaPresaServizio={form.watch('citta_presa') || ''}
                                indirizzoDestinazioneServizio={form.watch('indirizzo_destinazione') || ''}
                                cittaDestinazioneServizio={form.watch('citta_destinazione') || ''}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Aggiungi dalla rubrica */}
                      {tipoCliente === 'azienda' && (
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
                      )}

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
                  </>
                )}

                {/* SEZIONE: Info Aggiuntive */}
                {isClienteReady && (
                  <>
                    <Separator />
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
                  </>
                )}

                {/* SEZIONE: Email Notifiche - solo azienda */}
                {tipoCliente === 'azienda' && currentProfile?.azienda_id && isClienteReady && (
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
                {isClienteReady && (
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
                )}
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

      {/* Dialog Configurazione Percorso */}
      {configPasseggero && (
        <DialogConfiguraPercorsoPasseggero
          open={configDialogOpen}
          onOpenChange={(open) => {
            setConfigDialogOpen(open);
            if (!open) setConfigDialogIndex(null);
          }}
          passeggero={configPasseggero}
          datiServizio={{
            indirizzoPresaServizio: form.watch('indirizzo_presa') || '',
            cittaPresaServizio: form.watch('citta_presa') || '',
            indirizzoDestinazioneServizio: form.watch('indirizzo_destinazione') || '',
            cittaDestinazioneServizio: form.watch('citta_destinazione') || '',
            orarioServizio: form.watch('orario_servizio') || '',
          }}
          onConfirm={handleConfigConfirm}
        />
      )}
    </MainLayout>
  );
}
