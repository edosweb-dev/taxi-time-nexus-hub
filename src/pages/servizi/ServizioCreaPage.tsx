import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MainLayout } from "@/components/layouts/MainLayout";
import { toast } from "sonner";
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Info, 
  ArrowLeft,
  User,
  Car,
  Euro,
  Users,
  Mail,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Schema validazione completo
const servizioSchema = z.object({
  // Esistenti
  azienda_id: z.string().min(1, "Seleziona un'azienda"),
  data_servizio: z.string().min(1, "Inserisci la data"),
  orario_servizio: z.string().min(1, "Inserisci l'orario"),
  indirizzo_presa: z.string().min(1, "Inserisci indirizzo partenza"),
  indirizzo_destinazione: z.string().min(1, "Inserisci indirizzo destinazione"),
  metodo_pagamento: z.string().min(1, "Seleziona metodo pagamento"),
  
  // Nuovi
  referente_id: z.string().optional().nullable(),
  numero_commessa: z.string().optional().nullable(),
  citta_presa: z.string().optional().nullable(),
  citta_destinazione: z.string().optional().nullable(),
  assegnato_a: z.string().optional().nullable(),
  conducente_esterno: z.boolean().default(false),
  conducente_esterno_id: z.string().optional().nullable(),
  veicolo_id: z.string().optional().nullable(),
  ore_effettive: z.string().optional().nullable(),
  ore_fatturate: z.string().optional().nullable(),
  incasso_previsto: z.string().optional().nullable(),
  iva: z.string().default("22"),
  applica_provvigione: z.boolean().default(false),
  consegna_contanti_a: z.string().optional().nullable(),
  passeggeri_ids: z.array(z.string()).default([]),
  email_notifiche_ids: z.array(z.string()).default([]),
  note: z.string().optional().nullable(),
});

type ServizioFormData = z.infer<typeof servizioSchema>;

export const ServizioCreaPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasseggeriOpen, setIsPasseggeriOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const form = useForm<ServizioFormData>({
    resolver: zodResolver(servizioSchema),
    defaultValues: {
      data_servizio: new Date().toISOString().split('T')[0],
      orario_servizio: "12:00",
      iva: "22",
      conducente_esterno: false,
      applica_provvigione: false,
      passeggeri_ids: [],
      email_notifiche_ids: [],
    },
  });

  const { formState: { errors } } = form;

  const watchAziendaId = form.watch("azienda_id");
  const watchConducenteEsterno = form.watch("conducente_esterno");
  const watchMetodoPagamento = form.watch("metodo_pagamento");

  const queryClient = useQueryClient();

  const [isAddingPasseggero, setIsAddingPasseggero] = useState(false);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [newPasseggero, setNewPasseggero] = useState({
    nome_cognome: "",
    email: "",
    telefono: "",
    localita: "",
    indirizzo: "",
  });
  const [newEmail, setNewEmail] = useState({
    nome: "",
    email: "",
  });

  // Query aziende
  const { data: aziende, isLoading: isLoadingAziende } = useQuery({
    queryKey: ["aziende"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aziende")
        .select("id, nome")
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });

  // Query metodi pagamento
  const { data: metodiPagamento } = useQuery({
    queryKey: ["modalita-pagamenti"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modalita_pagamenti")
        .select("id, nome")
        .eq("attivo", true)
        .order("nome");
      
      if (error) throw error;
      return data;
    },
  });

  // Query: Referenti
  const { data: referenti } = useQuery({
    queryKey: ["referenti", watchAziendaId],
    queryFn: async () => {
      if (!watchAziendaId) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "cliente")
        .eq("azienda_id", watchAziendaId)
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: !!watchAziendaId,
  });

  // Query: Dipendenti
  const { data: dipendenti } = useQuery({
    queryKey: ["dipendenti"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role")
        .in("role", ["admin", "socio", "dipendente"])
        .order("first_name");
      if (error) throw error;
      return data;
    },
  });

  // Query: Veicoli
  const { data: veicoli } = useQuery({
    queryKey: ["veicoli"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("veicoli")
        .select("id, modello, targa")
        .eq("attivo", true)
        .order("modello");
      if (error) throw error;
      return data;
    },
  });

  // Query: Conducenti Esterni
  const { data: conducentiEsterni } = useQuery({
    queryKey: ["conducenti-esterni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conducenti_esterni")
        .select("id, nome_cognome")
        .eq("attivo", true)
        .order("nome_cognome");
      if (error) throw error;
      return data;
    },
  });

  // Query: Passeggeri
  const { data: passeggeri } = useQuery({
    queryKey: ["passeggeri", watchAziendaId],
    queryFn: async () => {
      if (!watchAziendaId) return [];
      const { data, error } = await supabase
        .from("passeggeri")
        .select("id, nome_cognome, email")
        .eq("azienda_id", watchAziendaId)
        .order("nome_cognome");
      if (error) throw error;
      return data;
    },
    enabled: !!watchAziendaId,
  });

  // Query: Email Notifiche
  const { data: emailNotifiche } = useQuery({
    queryKey: ["email-notifiche", watchAziendaId],
    queryFn: async () => {
      if (!watchAziendaId) return [];
      const { data, error } = await supabase
        .from("email_notifiche")
        .select("id, nome, email")
        .eq("azienda_id", watchAziendaId)
        .eq("attivo", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!watchAziendaId,
  });

  // Create Passeggero
  const handleCreatePasseggero = async () => {
    if (!watchAziendaId) {
      toast.error("Seleziona prima un'azienda");
      return;
    }

    if (!newPasseggero.nome_cognome) {
      toast.error("Nome e cognome obbligatorio");
      return;
    }

    setIsAddingPasseggero(true);
    try {
      const { data, error } = await supabase
        .from("passeggeri")
        .insert({
          azienda_id: watchAziendaId,
          referente_id: form.watch("referente_id") || null,
          nome_cognome: newPasseggero.nome_cognome,
          email: newPasseggero.email || null,
          telefono: newPasseggero.telefono || null,
          localita: newPasseggero.localita || null,
          indirizzo: newPasseggero.indirizzo || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Aggiungi automaticamente ai selezionati
      const currentIds = form.watch("passeggeri_ids");
      form.setValue("passeggeri_ids", [...currentIds, data.id]);

      // Invalida query per refresh
      queryClient.invalidateQueries({ queryKey: ["passeggeri", watchAziendaId] });

      // Reset form
      setNewPasseggero({
        nome_cognome: "",
        email: "",
        telefono: "",
        localita: "",
        indirizzo: "",
      });

      toast.success("Passeggero aggiunto!");
    } catch (error) {
      console.error("Errore creazione passeggero:", error);
      toast.error("Errore nella creazione del passeggero");
    } finally {
      setIsAddingPasseggero(false);
    }
  };

  // Create Email Notifica
  const handleCreateEmail = async () => {
    if (!watchAziendaId) {
      toast.error("Seleziona prima un'azienda");
      return;
    }

    if (!newEmail.nome || !newEmail.email) {
      toast.error("Nome e email obbligatori");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.email)) {
      toast.error("Formato email non valido");
      return;
    }

    setIsAddingEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      const { data, error } = await supabase
        .from("email_notifiche")
        .insert({
          azienda_id: watchAziendaId,
          nome: newEmail.nome,
          email: newEmail.email,
          attivo: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Aggiungi automaticamente ai selezionati
      const currentIds = form.watch("email_notifiche_ids");
      form.setValue("email_notifiche_ids", [...currentIds, data.id]);

      // Invalida query per refresh
      queryClient.invalidateQueries({ queryKey: ["email-notifiche", watchAziendaId] });

      // Reset form
      setNewEmail({
        nome: "",
        email: "",
      });

      toast.success("Email aggiunta!");
    } catch (error) {
      console.error("Errore creazione email:", error);
      toast.error("Errore nella creazione dell'email");
    } finally {
      setIsAddingEmail(false);
    }
  };

  const onSubmit = async (data: ServizioFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      // Prepare servizio data
      const servizioData = {
        azienda_id: data.azienda_id,
        referente_id: data.referente_id || null,
        created_by: user.id,
        data_servizio: data.data_servizio,
        orario_servizio: data.orario_servizio,
        numero_commessa: data.numero_commessa || null,
        indirizzo_presa: data.indirizzo_presa,
        citta_presa: data.citta_presa || null,
        indirizzo_destinazione: data.indirizzo_destinazione,
        citta_destinazione: data.citta_destinazione || null,
        metodo_pagamento: data.metodo_pagamento,
        stato: "da_assegnare",
        assegnato_a: data.assegnato_a || null,
        conducente_esterno: data.conducente_esterno,
        conducente_esterno_id: data.conducente_esterno ? data.conducente_esterno_id : null,
        veicolo_id: data.veicolo_id || null,
        ore_effettive: data.ore_effettive ? parseFloat(data.ore_effettive) : null,
        ore_fatturate: data.ore_fatturate ? parseFloat(data.ore_fatturate) : null,
        incasso_previsto: data.incasso_previsto ? parseFloat(data.incasso_previsto) : null,
        iva: parseFloat(data.iva),
        applica_provvigione: data.applica_provvigione,
        consegna_contanti_a: data.metodo_pagamento === "Contanti" ? data.consegna_contanti_a : null,
        note: data.note || null,
      };

      // Insert servizio
      const { data: servizio, error: servizioError } = await supabase
        .from("servizi")
        .insert(servizioData)
        .select()
        .single();

      if (servizioError) throw servizioError;

      // Insert passeggeri relations
      if (data.passeggeri_ids.length > 0) {
        const passeggeriRelations = data.passeggeri_ids.map(passeggero_id => ({
          servizio_id: servizio.id,
          passeggero_id,
        }));
        
        const { error: passeggeriError } = await supabase
          .from("servizi_passeggeri")
          .insert(passeggeriRelations);
        
        if (passeggeriError) throw passeggeriError;
      }

      // Insert email notifiche relations
      if (data.email_notifiche_ids.length > 0) {
        const emailRelations = data.email_notifiche_ids.map(email_notifica_id => ({
          servizio_id: servizio.id,
          email_notifica_id,
        }));
        
        const { error: emailError } = await supabase
          .from("servizi_email_notifiche")
          .insert(emailRelations);
        
        if (emailError) throw emailError;
      }

      toast.success("Servizio creato con successo!");
      navigate("/servizi");
    } catch (error) {
      console.error("Errore creazione servizio:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Errore nella creazione del servizio"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
    <div className="w-full p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/servizi")}
          className="mb-3 sm:mb-4 -ml-2"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Torna ai Servizi</span>
          <span className="sm:hidden">Indietro</span>
        </Button>
        
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Nuovo Servizio</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Compila i campi per creare un nuovo servizio
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-7xl">
        <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-0">
          
          {/* SEZIONE 1: Azienda e Contatto */}
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Azienda e Contatto</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Azienda */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="azienda_id" className="font-medium">
                  Azienda <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="azienda_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Seleziona azienda" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingAziende ? (
                          <SelectItem value="loading" disabled>
                            Caricamento...
                          </SelectItem>
                        ) : aziende?.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Nessuna azienda trovata
                          </SelectItem>
                        ) : (
                          aziende?.map((azienda) => (
                            <SelectItem key={azienda.id} value={azienda.id}>
                              {azienda.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.azienda_id && (
                  <p className="text-sm text-destructive">
                    {errors.azienda_id.message}
                  </p>
                )}
              </div>

              {/* Referente */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="font-medium">Referente</Label>
                <Controller
                  name="referente_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select 
                      value={field.value || ""} 
                      onValueChange={field.onChange}
                      disabled={!watchAziendaId}
                    >
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Seleziona referente" />
                      </SelectTrigger>
                      <SelectContent>
                        {referenti?.map((ref) => (
                          <SelectItem key={ref.id} value={ref.id}>
                            {ref.first_name} {ref.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Data Servizio */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="data_servizio" className="font-medium">
                  Data Servizio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="data_servizio"
                  type="date"
                  className="text-base"
                  {...form.register("data_servizio")}
                />
                {errors.data_servizio && (
                  <p className="text-sm text-destructive">
                    {errors.data_servizio.message}
                  </p>
                )}
              </div>

              {/* Orario Servizio */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="orario_servizio" className="font-medium">
                  Orario <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="orario_servizio"
                  type="time"
                  className="text-base"
                  {...form.register("orario_servizio")}
                />
                {errors.orario_servizio && (
                  <p className="text-sm text-destructive">
                    {errors.orario_servizio.message}
                  </p>
                )}
              </div>

              {/* Numero Commessa */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="numero_commessa" className="font-medium">Numero Commessa</Label>
                <Input
                  id="numero_commessa"
                  placeholder="Opzionale: ES-2024-001"
                  className="text-base"
                  {...form.register("numero_commessa")}
                />
              </div>
            </div>
          </Card>

          {/* SEZIONE 2: Percorso */}
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Percorso</h2>
            </div>
            
            <div className="space-y-6">
              {/* Partenza */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  Punto di Partenza
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="citta_presa" className="font-medium">Città</Label>
                    <Input
                      id="citta_presa"
                      placeholder="Es: Milano"
                      className="text-base"
                      {...form.register("citta_presa")}
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="indirizzo_presa" className="font-medium">
                      Indirizzo Presa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="indirizzo_presa"
                      placeholder="Es: Via Roma 123"
                      className="text-base"
                      {...form.register("indirizzo_presa")}
                    />
                    {errors.indirizzo_presa && (
                      <p className="text-sm text-destructive">
                        {errors.indirizzo_presa.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Destinazione */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  Destinazione
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="citta_destinazione" className="font-medium">Città</Label>
                    <Input
                      id="citta_destinazione"
                      placeholder="Es: Roma"
                      className="text-base"
                      {...form.register("citta_destinazione")}
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="indirizzo_destinazione" className="font-medium">
                      Indirizzo Destinazione <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="indirizzo_destinazione"
                      placeholder="Es: Aeroporto Fiumicino"
                      className="text-base"
                      {...form.register("indirizzo_destinazione")}
                    />
                    {errors.indirizzo_destinazione && (
                      <p className="text-sm text-destructive">
                        {errors.indirizzo_destinazione.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* SEZIONE 3: Assegnazione */}
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Assegnazione (Opzionale)</h2>
            </div>
            
            <div className="space-y-4">
              {/* Checkbox Conducente Esterno */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="conducente_esterno"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Conducente Esterno</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Conducente - conditional */}
                {!watchConducenteEsterno ? (
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="font-medium">Assegna a Dipendente/Socio</Label>
                    <Controller
                      name="assegnato_a"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Seleziona conducente" />
                          </SelectTrigger>
                          <SelectContent>
                            {dipendenti?.map((dip) => (
                              <SelectItem key={dip.id} value={dip.id}>
                                {dip.first_name} {dip.last_name} ({dip.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="font-medium">Conducente Esterno</Label>
                    <Controller
                      name="conducente_esterno_id"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Seleziona conducente esterno" />
                          </SelectTrigger>
                          <SelectContent>
                            {conducentiEsterni?.map((ce) => (
                              <SelectItem key={ce.id} value={ce.id}>
                                {ce.nome_cognome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}

                {/* Veicolo */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="font-medium">Veicolo</Label>
                  <Controller
                    name="veicolo_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Seleziona veicolo" />
                        </SelectTrigger>
                        <SelectContent>
                          {veicoli?.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.modello} - {v.targa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* SEZIONE 4: Dettagli Economici */}
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Dettagli Economici</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="metodo_pagamento" className="font-medium">
                    Metodo Pagamento <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="metodo_pagamento"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Seleziona metodo" />
                        </SelectTrigger>
                        <SelectContent>
                          {metodiPagamento?.map((metodo) => (
                            <SelectItem key={metodo.id} value={metodo.nome}>
                              {metodo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.metodo_pagamento && (
                    <p className="text-sm text-destructive">
                      {errors.metodo_pagamento.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="ore_effettive" className="font-medium">Ore Effettive</Label>
                  <Input
                    id="ore_effettive"
                    type="number"
                    step="0.5"
                    placeholder="Opzionale: 4.5"
                    className="text-base"
                    {...form.register("ore_effettive")}
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="ore_fatturate" className="font-medium">Ore Fatturate</Label>
                  <Input
                    id="ore_fatturate"
                    type="number"
                    step="0.5"
                    placeholder="Opzionale: 4.5"
                    className="text-base"
                    {...form.register("ore_fatturate")}
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="incasso_previsto" className="font-medium">Incasso Previsto (€)</Label>
                  <Input
                    id="incasso_previsto"
                    type="number"
                    step="0.01"
                    placeholder="Opzionale: 200.00"
                    className="text-base"
                    {...form.register("incasso_previsto")}
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="iva" className="font-medium">IVA (%)</Label>
                  <Input
                    id="iva"
                    type="number"
                    step="1"
                    placeholder="22"
                    className="text-base"
                    {...form.register("iva")}
                  />
                </div>

                {/* Consegna Contanti (conditional) */}
                {watchMetodoPagamento === "Contanti" && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label className="font-medium">Consegna Contanti a</Label>
                    <Controller
                      name="consegna_contanti_a"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Seleziona socio" />
                          </SelectTrigger>
                          <SelectContent>
                            {dipendenti
                              ?.filter(d => d.role === "socio")
                              .map((socio) => (
                                <SelectItem key={socio.id} value={socio.id}>
                                  {socio.first_name} {socio.last_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Checkbox Provvigione */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="applica_provvigione"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>Applica Provvigione</Label>
              </div>
            </div>
          </Card>

          {/* SEZIONE 5: Passeggeri */}
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="space-y-3 mb-4">
              {/* Header con toggle collapsible */}
              <button
                type="button"
                onClick={() => setIsPasseggeriOpen(!isPasseggeriOpen)}
                className="flex items-center justify-between w-full text-left sm:cursor-default sm:pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-semibold">Passeggeri (Opzionale)</h2>
                </div>
                {isPasseggeriOpen ? (
                  <ChevronUp className="h-4 w-4 sm:hidden" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:hidden" />
                )}
              </button>
              
              {/* Button Aggiungi Passeggero */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="default"
                    disabled={!watchAziendaId}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuovo Passeggero
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Aggiungi Passeggero</SheetTitle>
                    <SheetDescription>
                      Crea un nuovo passeggero per questa azienda
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-4 mt-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-pass-nome" className="font-medium">
                        Nome e Cognome <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="new-pass-nome"
                        placeholder="Mario Rossi"
                        value={newPasseggero.nome_cognome}
                        onChange={(e) => setNewPasseggero({
                          ...newPasseggero,
                          nome_cognome: e.target.value
                        })}
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-pass-email" className="font-medium">Email</Label>
                      <Input
                        id="new-pass-email"
                        type="email"
                        placeholder="mario.rossi@example.com"
                        value={newPasseggero.email}
                        onChange={(e) => setNewPasseggero({
                          ...newPasseggero,
                          email: e.target.value
                        })}
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-pass-telefono" className="font-medium">Telefono</Label>
                      <Input
                        id="new-pass-telefono"
                        type="tel"
                        placeholder="+39 333 1234567"
                        value={newPasseggero.telefono}
                        onChange={(e) => setNewPasseggero({
                          ...newPasseggero,
                          telefono: e.target.value
                        })}
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-pass-localita" className="font-medium">Località</Label>
                      <Input
                        id="new-pass-localita"
                        placeholder="Milano"
                        value={newPasseggero.localita}
                        onChange={(e) => setNewPasseggero({
                          ...newPasseggero,
                          localita: e.target.value
                        })}
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-pass-indirizzo" className="font-medium">Indirizzo</Label>
                      <Input
                        id="new-pass-indirizzo"
                        placeholder="Via Roma 123"
                        value={newPasseggero.indirizzo}
                        onChange={(e) => setNewPasseggero({
                          ...newPasseggero,
                          indirizzo: e.target.value
                        })}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleCreatePasseggero}
                      disabled={isAddingPasseggero || !newPasseggero.nome_cognome}
                      className="w-full"
                    >
                      {isAddingPasseggero ? "Creazione..." : "Crea Passeggero"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Contenuto collapsible */}
            <div className={`${isPasseggeriOpen ? 'block' : 'hidden'} sm:block`}>
              {/* Lista Passeggeri Esistenti */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="font-medium">Seleziona Passeggeri</Label>
                <Controller
                  name="passeggeri_ids"
                  control={form.control}
                  render={({ field }) => (
                    <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                      {!watchAziendaId ? (
                        <p className="text-sm text-muted-foreground">
                          Seleziona prima un'azienda
                        </p>
                      ) : passeggeri?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nessun passeggero disponibile. Creane uno con il pulsante sopra.
                        </p>
                      ) : (
                        passeggeri?.map((pass) => (
                          <div key={pass.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value.includes(pass.id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, pass.id]
                                  : field.value.filter(id => id !== pass.id);
                                field.onChange(newValue);
                              }}
                            />
                            <Label className="font-normal">
                              {pass.nome_cognome}
                              {pass.email && ` (${pass.email})`}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* SEZIONE 6: Email Notifiche */}
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="space-y-3 mb-4">
              {/* Header con toggle collapsible */}
              <button
                type="button"
                onClick={() => setIsEmailOpen(!isEmailOpen)}
                className="flex items-center justify-between w-full text-left sm:cursor-default sm:pointer-events-none"
              >
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-semibold">Email Notifiche (Opzionale)</h2>
                </div>
                {isEmailOpen ? (
                  <ChevronUp className="h-4 w-4 sm:hidden" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:hidden" />
                )}
              </button>
              
              {/* Button Aggiungi Email */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="default"
                    disabled={!watchAziendaId}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuova Email
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Aggiungi Email Notifica</SheetTitle>
                    <SheetDescription>
                      Crea una nuova email da notificare per questa azienda
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-4 mt-6">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-email-nome" className="font-medium">
                        Nome Contatto <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="new-email-nome"
                        placeholder="Es: Ufficio Logistica"
                        value={newEmail.nome}
                        onChange={(e) => setNewEmail({
                          ...newEmail,
                          nome: e.target.value
                        })}
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="new-email-address" className="font-medium">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="new-email-address"
                        type="email"
                        placeholder="logistica@azienda.it"
                        value={newEmail.email}
                        onChange={(e) => setNewEmail({
                          ...newEmail,
                          email: e.target.value
                        })}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleCreateEmail}
                      disabled={isAddingEmail || !newEmail.nome || !newEmail.email}
                      className="w-full"
                    >
                      {isAddingEmail ? "Creazione..." : "Crea Email Notifica"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Contenuto collapsible */}
            <div className={`${isEmailOpen ? 'block' : 'hidden'} sm:block`}>
              {/* Lista Email Esistenti */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="font-medium">Seleziona Email da Notificare</Label>
              <Controller
                name="email_notifiche_ids"
                control={form.control}
                render={({ field }) => (
                  <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                    {!watchAziendaId ? (
                      <p className="text-sm text-muted-foreground">
                        Seleziona prima un'azienda
                      </p>
                    ) : emailNotifiche?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nessuna email configurata. Creane una con il pulsante sopra.
                      </p>
                    ) : (
                      emailNotifiche?.map((email) => (
                        <div key={email.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value.includes(email.id)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, email.id]
                                : field.value.filter(id => id !== email.id);
                              field.onChange(newValue);
                            }}
                          />
                          <Label className="font-normal">
                            {email.nome} ({email.email})
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                )}
              />
              </div>
            </div>
          </Card>

          {/* SEZIONE 7: Note */}
          <Card className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Note</h2>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="note" className="font-medium">Note Aggiuntive</Label>
              <Textarea
                id="note"
                placeholder="Opzionale: Eventuali note sul servizio..."
                rows={4}
                className="text-base"
                {...form.register("note")}
              />
            </div>
          </Card>

        </div>

        {/* Footer Buttons - Sticky Mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-background border-t mt-6 sm:mt-8 pt-3 sm:pt-6 pb-3 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 sm:relative sm:bg-transparent z-10 shadow-lg sm:shadow-none">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[200px] order-1 sm:order-2"
              size="lg"
            >
              {isSubmitting ? "Creazione..." : "Crea Servizio"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/servizi")}
              className="w-full sm:w-auto order-2 sm:order-1"
              size="lg"
            >
              Annulla
            </Button>
          </div>
        </div>
      </form>
    </div>
    </MainLayout>
  );
};
