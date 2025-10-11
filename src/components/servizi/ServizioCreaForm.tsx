import { useState, useEffect } from "react";
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
  ChevronUp,
  Loader2
} from "lucide-react";

// Schema validazione completo
const servizioSchema = z.object({
  azienda_id: z.string().min(1, "Seleziona un'azienda"),
  data_servizio: z.string().min(1, "Inserisci la data"),
  orario_servizio: z.string().min(1, "Inserisci l'orario"),
  indirizzo_presa: z.string().min(1, "Inserisci indirizzo partenza"),
  indirizzo_destinazione: z.string().min(1, "Inserisci indirizzo destinazione"),
  metodo_pagamento: z.string().min(1, "Seleziona metodo pagamento"),
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

interface ServizioCreaFormProps {
  mode?: 'create' | 'edit';
  servizioId?: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServizioCreaForm({ 
  mode = 'create',
  servizioId,
  initialData,
  onSuccess,
  onCancel,
}: ServizioCreaFormProps) {
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

  // Pre-popola form in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData && servizioId) {
      const loadData = async () => {
        // Fetch passeggeri e email IDs
        const [passResult, emailResult] = await Promise.all([
          supabase.from('servizi_passeggeri').select('passeggero_id').eq('servizio_id', servizioId),
          supabase.from('servizi_email_notifiche').select('email_notifica_id').eq('servizio_id', servizioId)
        ]);

        form.reset({
          azienda_id: initialData.azienda_id || '',
          referente_id: initialData.referente_id || null,
          data_servizio: initialData.data_servizio || new Date().toISOString().split('T')[0],
          orario_servizio: initialData.orario_servizio || "12:00",
          numero_commessa: initialData.numero_commessa || null,
          citta_presa: initialData.citta_presa || null,
          indirizzo_presa: initialData.indirizzo_presa || '',
          citta_destinazione: initialData.citta_destinazione || null,
          indirizzo_destinazione: initialData.indirizzo_destinazione || '',
          metodo_pagamento: initialData.metodo_pagamento || '',
          conducente_esterno: initialData.conducente_esterno || false,
          assegnato_a: initialData.assegnato_a || null,
          conducente_esterno_id: initialData.conducente_esterno_id || null,
          veicolo_id: initialData.veicolo_id || null,
          ore_effettive: initialData.ore_effettive?.toString() || null,
          ore_fatturate: initialData.ore_fatturate?.toString() || null,
          incasso_previsto: initialData.incasso_previsto?.toString() || null,
          iva: initialData.iva?.toString() || "22",
          applica_provvigione: initialData.applica_provvigione || false,
          consegna_contanti_a: initialData.consegna_contanti_a || null,
          passeggeri_ids: passResult.data?.map(r => r.passeggero_id) || [],
          email_notifiche_ids: emailResult.data?.map(r => r.email_notifica_id) || [],
          note: initialData.note || null,
        });
      };
      loadData();
    }
  }, [mode, initialData, servizioId, form]);

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
      const currentIds = form.watch("passeggeri_ids");
      form.setValue("passeggeri_ids", [...currentIds, data.id]);
      queryClient.invalidateQueries({ queryKey: ["passeggeri", watchAziendaId] });
      setNewPasseggero({ nome_cognome: "", email: "", telefono: "", localita: "", indirizzo: "" });
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
      const currentIds = form.watch("email_notifiche_ids");
      form.setValue("email_notifiche_ids", [...currentIds, data.id]);
      queryClient.invalidateQueries({ queryKey: ["email-notifiche", watchAziendaId] });
      setNewEmail({ nome: "", email: "" });
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
        stato: mode === 'create' ? "da_assegnare" : initialData?.stato || "da_assegnare",
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

      if (mode === 'edit' && servizioId) {
        const { error: servizioError } = await supabase.from("servizi").update(servizioData).eq('id', servizioId);
        if (servizioError) throw servizioError;

        await supabase.from("servizi_passeggeri").delete().eq('servizio_id', servizioId);
        if (data.passeggeri_ids.length > 0) {
          const { error: passErr } = await supabase.from("servizi_passeggeri")
            .insert(data.passeggeri_ids.map(pid => ({ servizio_id: servizioId, passeggero_id: pid })));
          if (passErr) throw passErr;
        }

        await supabase.from("servizi_email_notifiche").delete().eq('servizio_id', servizioId);
        if (data.email_notifiche_ids.length > 0) {
          const { error: emailErr } = await supabase.from("servizi_email_notifiche")
            .insert(data.email_notifiche_ids.map(eid => ({ servizio_id: servizioId, email_notifica_id: eid })));
          if (emailErr) throw emailErr;
        }

        toast.success("Servizio aggiornato con successo!");
      } else {
        const { data: servizio, error: servizioError } = await supabase.from("servizi").insert(servizioData).select().single();
        if (servizioError) throw servizioError;

        if (data.passeggeri_ids.length > 0) {
          const { error: passErr } = await supabase.from("servizi_passeggeri")
            .insert(data.passeggeri_ids.map(pid => ({ servizio_id: servizio.id, passeggero_id: pid })));
          if (passErr) throw passErr;
        }

        if (data.email_notifiche_ids.length > 0) {
          const { error: emailErr } = await supabase.from("servizi_email_notifiche")
            .insert(data.email_notifiche_ids.map(eid => ({ servizio_id: servizio.id, email_notifica_id: eid })));
          if (emailErr) throw emailErr;
        }

        toast.success("Servizio creato con successo!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/servizi");
      }
    } catch (error) {
      console.error("Errore:", error);
      toast.error(mode === 'edit' ? "Errore nell'aggiornamento" : "Errore nella creazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate("/servizi");
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" onClick={handleCancel} className="mb-3 sm:mb-4 -ml-2" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Torna ai Servizi</span>
          <span className="sm:hidden">Indietro</span>
        </Button>
        
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          {mode === 'edit' ? 'Modifica Servizio' : 'Nuovo Servizio'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {mode === 'edit' ? 'Modifica le informazioni del servizio' : 'Compila i campi per creare un nuovo servizio'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full sm:max-w-7xl">
        <div className="w-full space-y-4 sm:space-y-6 pb-20 sm:pb-0">
          
          {/* SEZIONE 1: Azienda e Contatto */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
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
          <Card className="w-full p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Percorso</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Indirizzo Presa */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="indirizzo_presa" className="font-medium">
                  Indirizzo di Presa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="indirizzo_presa"
                  className="text-base"
                  {...form.register("indirizzo_presa")}
                />
                {errors.indirizzo_presa && (
                  <p className="text-sm text-destructive">
                    {errors.indirizzo_presa.message}
                  </p>
                )}
              </div>

              {/* Città Presa */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="citta_presa" className="font-medium">Città di Presa</Label>
                <Input
                  id="citta_presa"
                  className="text-base"
                  {...form.register("citta_presa")}
                />
              </div>

              {/* Indirizzo Destinazione */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="indirizzo_destinazione" className="font-medium">
                  Indirizzo di Destinazione <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="indirizzo_destinazione"
                  className="text-base"
                  {...form.register("indirizzo_destinazione")}
                />
                {errors.indirizzo_destinazione && (
                  <p className="text-sm text-destructive">
                    {errors.indirizzo_destinazione.message}
                  </p>
                )}
              </div>

              {/* Città Destinazione */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="citta_destinazione" className="font-medium">Città di Destinazione</Label>
                <Input
                  id="citta_destinazione"
                  className="text-base"
                  {...form.register("citta_destinazione")}
                />
              </div>
            </div>
          </Card>

          {/* SEZIONE 3: Assegnazione */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Assegnazione</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Assegnato a */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="assegnato_a" className="font-medium">Assegnato a</Label>
                <Controller
                  name="assegnato_a"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Seleziona dipendente" />
                      </SelectTrigger>
                      <SelectContent>
                        {dipendenti?.map((dip) => (
                          <SelectItem key={dip.id} value={dip.id}>
                            {dip.first_name} {dip.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Conducente Esterno */}
              <div className="space-y-1.5 sm:space-y-2 flex flex-col justify-center">
                <Controller
                  name="conducente_esterno"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="conducente_esterno"
                    />
                  )}
                />
                <Label htmlFor="conducente_esterno" className="font-medium cursor-pointer">
                  Conducente Esterno
                </Label>
              </div>

              {/* Se conducente esterno, seleziona conducente */}
              {watchConducenteEsterno && (
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="conducente_esterno_id" className="font-medium">Conducente Esterno</Label>
                  <Controller
                    name="conducente_esterno_id"
                    control={form.control}
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Seleziona conducente esterno" />
                        </SelectTrigger>
                        <SelectContent>
                          {conducentiEsterni?.map((con) => (
                            <SelectItem key={con.id} value={con.id}>
                              {con.nome_cognome}
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
                <Label htmlFor="veicolo_id" className="font-medium">Veicolo</Label>
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
                            {v.modello} ({v.targa})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* SEZIONE 4: Dettagli Economici */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Euro className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Dettagli Economici</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Metodo Pagamento */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="metodo_pagamento" className="font-medium">
                  Metodo di Pagamento <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="metodo_pagamento"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="text-base">
                        <SelectValue placeholder="Seleziona metodo pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {metodiPagamento?.map((mp) => (
                          <SelectItem key={mp.id} value={mp.nome}>
                            {mp.nome}
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

              {/* Ore Effettive */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="ore_effettive" className="font-medium">Ore Effettive</Label>
                <Input
                  id="ore_effettive"
                  type="number"
                  step="0.1"
                  min="0"
                  className="text-base"
                  {...form.register("ore_effettive")}
                />
              </div>

              {/* Ore Fatturate */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="ore_fatturate" className="font-medium">Ore Fatturate</Label>
                <Input
                  id="ore_fatturate"
                  type="number"
                  step="0.1"
                  min="0"
                  className="text-base"
                  {...form.register("ore_fatturate")}
                />
              </div>

              {/* Incasso Previsto */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="incasso_previsto" className="font-medium">Incasso Previsto</Label>
                <Input
                  id="incasso_previsto"
                  type="number"
                  step="0.01"
                  min="0"
                  className="text-base"
                  {...form.register("incasso_previsto")}
                />
              </div>

              {/* IVA */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="iva" className="font-medium">IVA (%)</Label>
                <Input
                  id="iva"
                  type="number"
                  step="0.01"
                  min="0"
                  className="text-base"
                  {...form.register("iva")}
                />
              </div>

              {/* Applica Provvigione */}
              <div className="space-y-1.5 sm:space-y-2 flex flex-col justify-center">
                <Controller
                  name="applica_provvigione"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="applica_provvigione"
                    />
                  )}
                />
                <Label htmlFor="applica_provvigione" className="font-medium cursor-pointer">
                  Applica Provvigione
                </Label>
              </div>

              {/* Consegna Contanti a */}
              {watchMetodoPagamento === "Contanti" && (
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="consegna_contanti_a" className="font-medium">Consegna Contanti a</Label>
                  <Input
                    id="consegna_contanti_a"
                    className="text-base"
                    {...form.register("consegna_contanti_a")}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* SEZIONE 5: Passeggeri */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h2 className="text-base sm:text-lg font-semibold">Passeggeri</h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPasseggeriOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi Passeggero
              </Button>
            </div>

            {/* Lista passeggeri selezionati */}
            <div className="space-y-2">
              {form.watch("passeggeri_ids").length === 0 && (
                <p className="text-sm text-muted-foreground">Nessun passeggero selezionato</p>
              )}
              {form.watch("passeggeri_ids").map((id) => {
                const passeggero = passeggeri?.find(p => p.id === id);
                if (!passeggero) return null;
                return (
                  <div key={id} className="flex items-center justify-between border rounded p-2">
                    <div>
                      {passeggero.nome_cognome} {passeggero.email && `(${passeggero.email})`}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const current = form.watch("passeggeri_ids");
                        form.setValue("passeggeri_ids", current.filter(pid => pid !== id));
                      }}
                      aria-label="Rimuovi passeggero"
                    >
                      <Info className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Sheet per aggiungere passeggeri */}
            <Sheet open={isPasseggeriOpen} onOpenChange={setIsPasseggeriOpen}>
              <SheetContent side="right" className="w-full max-w-md">
                <SheetHeader>
                  <SheetTitle>Aggiungi Passeggero</SheetTitle>
                  <SheetDescription>
                    Seleziona uno o più passeggeri dall'elenco o aggiungi un nuovo passeggero.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 mt-4">
                  {/* Lista passeggeri disponibili */}
                  <div className="max-h-64 overflow-y-auto border rounded p-2">
                    {passeggeri?.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nessun passeggero disponibile</p>
                    )}
                    {passeggeri?.map((p) => {
                      const selected = form.watch("passeggeri_ids").includes(p.id);
                      return (
                        <div key={p.id} className="flex items-center justify-between py-1">
                          <div>{p.nome_cognome} {p.email && `(${p.email})`}</div>
                          <Button
                            size="sm"
                            variant={selected ? "secondary" : "outline"}
                            onClick={() => {
                              const current = form.watch("passeggeri_ids");
                              if (selected) {
                                form.setValue("passeggeri_ids", current.filter(pid => pid !== p.id));
                              } else {
                                form.setValue("passeggeri_ids", [...current, p.id]);
                              }
                            }}
                          >
                            {selected ? "Rimuovi" : "Aggiungi"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form per nuovo passeggero */}
                  <div className="border rounded p-3">
                    <h3 className="font-semibold mb-2">Nuovo Passeggero</h3>
                    <Input
                      placeholder="Nome e Cognome"
                      value={newPasseggero.nome_cognome}
                      onChange={(e) => setNewPasseggero({ ...newPasseggero, nome_cognome: e.target.value })}
                      className="mb-2"
                    />
                    <Input
                      placeholder="Email"
                      value={newPasseggero.email}
                      onChange={(e) => setNewPasseggero({ ...newPasseggero, email: e.target.value })}
                      className="mb-2"
                    />
                    <Input
                      placeholder="Telefono"
                      value={newPasseggero.telefono}
                      onChange={(e) => setNewPasseggero({ ...newPasseggero, telefono: e.target.value })}
                      className="mb-2"
                    />
                    <Input
                      placeholder="Località"
                      value={newPasseggero.localita}
                      onChange={(e) => setNewPasseggero({ ...newPasseggero, localita: e.target.value })}
                      className="mb-2"
                    />
                    <Input
                      placeholder="Indirizzo"
                      value={newPasseggero.indirizzo}
                      onChange={(e) => setNewPasseggero({ ...newPasseggero, indirizzo: e.target.value })}
                      className="mb-2"
                    />
                    <Button
                      onClick={handleCreatePasseggero}
                      disabled={isAddingPasseggero}
                      className="w-full"
                    >
                      {isAddingPasseggero ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                      Aggiungi Passeggero
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </Card>

          {/* SEZIONE 6: Email Notifiche */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h2 className="text-base sm:text-lg font-semibold">Email Notifiche</h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEmailOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi Email
              </Button>
            </div>

            {/* Lista email selezionate */}
            <div className="space-y-2">
              {form.watch("email_notifiche_ids").length === 0 && (
                <p className="text-sm text-muted-foreground">Nessuna email selezionata</p>
              )}
              {form.watch("email_notifiche_ids").map((id) => {
                const email = emailNotifiche?.find(e => e.id === id);
                if (!email) return null;
                return (
                  <div key={id} className="flex items-center justify-between border rounded p-2">
                    <div>
                      {email.nome} ({email.email})
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const current = form.watch("email_notifiche_ids");
                        form.setValue("email_notifiche_ids", current.filter(eid => eid !== id));
                      }}
                      aria-label="Rimuovi email"
                    >
                      <Info className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Sheet per aggiungere email */}
            <Sheet open={isEmailOpen} onOpenChange={setIsEmailOpen}>
              <SheetContent side="right" className="w-full max-w-md">
                <SheetHeader>
                  <SheetTitle>Aggiungi Email Notifica</SheetTitle>
                  <SheetDescription>
                    Seleziona una o più email dall'elenco o aggiungi una nuova email.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 mt-4">
                  {/* Lista email disponibili */}
                  <div className="max-h-64 overflow-y-auto border rounded p-2">
                    {emailNotifiche?.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nessuna email disponibile</p>
                    )}
                    {emailNotifiche?.map((e) => {
                      const selected = form.watch("email_notifiche_ids").includes(e.id);
                      return (
                        <div key={e.id} className="flex items-center justify-between py-1">
                          <div>{e.nome} ({e.email})</div>
                          <Button
                            size="sm"
                            variant={selected ? "secondary" : "outline"}
                            onClick={() => {
                              const current = form.watch("email_notifiche_ids");
                              if (selected) {
                                form.setValue("email_notifiche_ids", current.filter(eid => eid !== e.id));
                              } else {
                                form.setValue("email_notifiche_ids", [...current, e.id]);
                              }
                            }}
                          >
                            {selected ? "Rimuovi" : "Aggiungi"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Form per nuova email */}
                  <div className="border rounded p-3">
                    <h3 className="font-semibold mb-2">Nuova Email</h3>
                    <Input
                      placeholder="Nome"
                      value={newEmail.nome}
                      onChange={(e) => setNewEmail({ ...newEmail, nome: e.target.value })}
                      className="mb-2"
                    />
                    <Input
                      placeholder="Email"
                      value={newEmail.email}
                      onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
                      className="mb-2"
                    />
                    <Button
                      onClick={handleCreateEmail}
                      disabled={isAddingEmail}
                      className="w-full"
                    >
                      {isAddingEmail ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                      Aggiungi Email
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </Card>

          {/* SEZIONE 7: Note */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Note</h2>
            </div>

            <Textarea
              placeholder="Inserisci eventuali note"
              {...form.register("note")}
              rows={4}
            />
          </Card>
        </div>

        <div className="sticky inset-x-0 bottom-0 bg-background border-t mt-6 sm:mt-8 pt-3 sm:pt-6 pb-3 sm:pb-0 sm:relative sm:bg-transparent z-10 shadow-lg sm:shadow-none">
          <div className="px-3 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-w-[200px] order-1 sm:order-2" size="lg">
                {isSubmitting ? (mode === 'edit' ? "Salvataggio..." : "Creazione...") : (mode === 'edit' ? "Salva Modifiche" : "Crea Servizio")}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto order-2 sm:order-1" size="lg">
                Annulla
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
