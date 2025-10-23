import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, Controller, FormProvider } from "react-hook-form";
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
import { ClientePrivatoFields } from "@/components/servizi/form-fields/ClientePrivatoFields";
import { createClientePrivato } from "@/lib/api/clientiPrivati/createClientePrivato";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Schema validazione completo
const servizioSchema = z.object({
  // Tipo cliente
  tipo_cliente: z.enum(['azienda', 'privato'], {
    required_error: "Seleziona il tipo di cliente"
  }).default('azienda'),
  
  // Esistenti
  azienda_id: z.string().optional(),
  data_servizio: z.string().min(1, "Inserisci la data"),
  orario_servizio: z.string().min(1, "Inserisci l'orario"),
  indirizzo_presa: z.string().min(1, "Inserisci indirizzo partenza"),
  indirizzo_destinazione: z.string().min(1, "Inserisci indirizzo destinazione"),
  metodo_pagamento: z.string().min(1, "Seleziona metodo pagamento"),
  
  // Cliente privato
  cliente_privato_id: z.string().optional().nullable(),
  cliente_privato_nome: z.string().optional(),
  cliente_privato_cognome: z.string().optional(),
  cliente_privato_email: z.string().email("Email non valida").optional().or(z.literal('')),
  cliente_privato_telefono: z.string().optional(),
  cliente_privato_indirizzo: z.string().optional(),
  cliente_privato_citta: z.string().optional(),
  cliente_privato_note: z.string().optional(),
  salva_cliente_anagrafica: z.boolean().default(false),
  
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
  incasso_previsto: z.number().optional().nullable(),
  iva: z.number().optional(),
  importo_totale_calcolato: z.number().optional().nullable(),
  applica_provvigione: z.boolean().default(false),
  consegna_contanti_a: z.string().optional().nullable(),
  passeggeri_ids: z.array(z.string()).default([]),
  email_notifiche_ids: z.array(z.string()).default([]),
  note: z.string().optional().nullable(),
  usa_indirizzo_passeggero_partenza: z.boolean().optional(),
  usa_indirizzo_passeggero_destinazione: z.boolean().optional(),
}).refine((data) => {
  // Validation: se azienda → azienda_id required
  if (data.tipo_cliente === 'azienda') {
    return !!data.azienda_id;
  }
  return true;
}, {
  message: "Seleziona un'azienda",
  path: ["azienda_id"]
}).refine((data) => {
  // Validation: se privato → (cliente_privato_id OR nome+cognome) required
  if (data.tipo_cliente === 'privato') {
    return (
      !!data.cliente_privato_id || 
      (!!data.cliente_privato_nome && !!data.cliente_privato_cognome)
    );
  }
  return true;
}, {
  message: "Seleziona un cliente dall'anagrafica oppure inserisci nome e cognome",
  path: ["cliente_privato_nome"]
});

type ServizioFormData = z.infer<typeof servizioSchema>;

interface ServizioCreaPageProps {
  mode?: 'create' | 'edit';
  servizioId?: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ServizioCreaPage = ({
  mode = 'create',
  servizioId,
  initialData,
  onSuccess,
  onCancel
}: ServizioCreaPageProps = {}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formMode = searchParams.get("mode") || "completo";
  const isVeloce = formMode === "veloce";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasseggeriOpen, setIsPasseggeriOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const form = useForm<ServizioFormData>({
    resolver: zodResolver(servizioSchema),
    defaultValues: {
      tipo_cliente: 'azienda',
      azienda_id: '',
      referente_id: null,
      cliente_privato_id: null,
      cliente_privato_nome: "",
      cliente_privato_cognome: "",
      cliente_privato_email: "",
      cliente_privato_telefono: "",
      cliente_privato_indirizzo: "",
      cliente_privato_citta: "",
      cliente_privato_note: "",
      salva_cliente_anagrafica: false,
      data_servizio: new Date().toISOString().split('T')[0],
      orario_servizio: isVeloce ? "00:00" : "12:00",
      indirizzo_presa: isVeloce ? "Da definire" : "",
      indirizzo_destinazione: isVeloce ? "Da definire" : "",
      metodo_pagamento: isVeloce ? "da_definire" : "",
      incasso_previsto: null,
      iva: 22,
      importo_totale_calcolato: null,
      conducente_esterno: false,
      applica_provvigione: false,
      passeggeri_ids: [],
      email_notifiche_ids: [],
      usa_indirizzo_passeggero_partenza: false,
      usa_indirizzo_passeggero_destinazione: false,
    },
  });

  const { formState: { errors } } = form;

  // Pre-popola form in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData && servizioId) {
      const loadData = async () => {
        const [passResult, emailResult] = await Promise.all([
          supabase.from('servizi_passeggeri').select('passeggero_id').eq('servizio_id', servizioId),
          supabase.from('servizi_email_notifiche').select('email_notifica_id').eq('servizio_id', servizioId)
        ]);

        form.reset({
          tipo_cliente: initialData.tipo_cliente || 'azienda',
          azienda_id: initialData.azienda_id || '',
          referente_id: initialData.referente_id || null,
          cliente_privato_id: initialData.cliente_privato_id || null,
          cliente_privato_nome: initialData.cliente_privato_nome || '',
          cliente_privato_cognome: initialData.cliente_privato_cognome || '',
          cliente_privato_email: initialData.clienti_privati?.email || '',
          cliente_privato_telefono: initialData.clienti_privati?.telefono || '',
          cliente_privato_indirizzo: initialData.clienti_privati?.indirizzo || '',
          cliente_privato_citta: initialData.clienti_privati?.citta || '',
          cliente_privato_note: initialData.clienti_privati?.note || '',
          salva_cliente_anagrafica: false,
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
          incasso_previsto: initialData.incasso_previsto || null,
          iva: initialData.iva || 22,
          importo_totale_calcolato: null,
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
  const watchTipoCliente = form.watch("tipo_cliente");
  const watchIncassoPrevisto = form.watch("incasso_previsto");
  const watchIva = form.watch("iva");

  const queryClient = useQueryClient();

  const [isAddingPasseggero, setIsAddingPasseggero] = useState(false);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [newPasseggero, setNewPasseggero] = useState({
    nome_cognome: "",
    email: "",
    telefono: "",
    localita: "",
    indirizzo: "",
    salva_in_database: true,
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

  // Query: Impostazioni (metodi pagamento e aliquote IVA)
  const { data: impostazioniData } = useQuery({
    queryKey: ["impostazioni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impostazioni")
        .select("metodi_pagamento, aliquote_iva")
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const metodiPagamento = Array.isArray(impostazioniData?.metodi_pagamento) 
    ? impostazioniData.metodi_pagamento 
    : [];
  const aliquoteIva = Array.isArray(impostazioniData?.aliquote_iva) 
    ? impostazioniData.aliquote_iva.map((a: any) => a.percentuale)
    : [22, 10, 4, 0];

  // Trova metodo selezionato con useMemo per performance
  const metodoPagamentoSelezionato = useMemo(() => {
    return metodiPagamento?.find((m: any) => m.nome === watchMetodoPagamento);
  }, [metodiPagamento, watchMetodoPagamento]);

  const mostraIva = (metodoPagamentoSelezionato as any)?.iva_applicabile !== false;

  // Calcolo automatico importo totale con IVA
  useEffect(() => {
    if (mostraIva && watchIncassoPrevisto !== null && watchIncassoPrevisto !== undefined && watchIva !== undefined) {
      const netto = Number(watchIncassoPrevisto) || 0;
      const percentualeIva = Number(watchIva) || 0;
      const importoIva = netto * (percentualeIva / 100);
      const totale = netto + importoIva;
      
      console.log('[Calcolo IVA] Netto:', netto, '| IVA%:', percentualeIva, '| Totale:', totale.toFixed(2));
      
      form.setValue('importo_totale_calcolato', Number(totale.toFixed(2)), { 
        shouldValidate: false,
        shouldDirty: false 
      });
    } else {
      form.setValue('importo_totale_calcolato', watchIncassoPrevisto || null, { 
        shouldValidate: false,
        shouldDirty: false 
      });
    }
  }, [watchIncassoPrevisto, watchIva, mostraIva, form]);

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
  const { 
    data: passeggeri, 
    isLoading: isLoadingPasseggeri,
    error: errorPasseggeri 
  } = useQuery({
    queryKey: ["passeggeri", watchAziendaId],
    queryFn: async () => {
      console.log('[Passeggeri] Fetching for aziendaId:', watchAziendaId);
      
      if (!watchAziendaId) return [];
      
      const { data, error } = await supabase
        .from("passeggeri")
        .select("id, nome_cognome, email, indirizzo, localita")
        .eq("azienda_id", watchAziendaId)
        .order("nome_cognome");
      
      if (error) {
        console.error('[Passeggeri] Error:', error);
        throw error;
      }
      
      console.log('[Passeggeri] Data received:', data);
      return data;
    },
    enabled: !!watchAziendaId && watchTipoCliente === 'azienda',
  });

  // Passeggero selezionato per indirizzo (usa useMemo per performance)
  const watchPasseggeriIds = form.watch("passeggeri_ids");
  const passeggeroSelezionato = useMemo(() => {
    if (!watchPasseggeriIds || watchPasseggeriIds.length === 0) return null;
    return passeggeri?.find(p => p.id === watchPasseggeriIds[0]) || null;
  }, [passeggeri, watchPasseggeriIds]);

  // Debug log per tracciare il passeggero selezionato
  useEffect(() => {
    if (passeggeroSelezionato) {
      console.log('[Percorso] Passeggero selezionato:', passeggeroSelezionato);
    }
  }, [passeggeroSelezionato]);

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
    enabled: !!watchAziendaId && watchTipoCliente === 'azienda',
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
        salva_in_database: true,
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
    
    console.log("=== INIZIO SUBMIT SERVIZIO ===");
    console.log("Tipo cliente:", data.tipo_cliente);
    console.log("Dati form:", {
      cliente_privato_id: data.cliente_privato_id,
      cliente_privato_nome: data.cliente_privato_nome,
      cliente_privato_cognome: data.cliente_privato_cognome,
      salva_cliente_anagrafica: data.salva_cliente_anagrafica,
    });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utente non autenticato");

      let clientePrivatoId = data.cliente_privato_id;
      let clientePrivatoNome = data.cliente_privato_nome;
      let clientePrivatoCognome = data.cliente_privato_cognome;

      // 1. Se cliente privato + salva_anagrafica = true → crea in anagrafica
      if (
        data.tipo_cliente === 'privato' && 
        data.salva_cliente_anagrafica &&
        !clientePrivatoId &&
        data.cliente_privato_nome &&
        data.cliente_privato_cognome
      ) {
        try {
          console.log("Salvataggio cliente in anagrafica...");
          const nuovoCliente = await createClientePrivato({
            nome: data.cliente_privato_nome,
            cognome: data.cliente_privato_cognome,
            email: data.cliente_privato_email,
            telefono: data.cliente_privato_telefono,
            indirizzo: data.cliente_privato_indirizzo,
            citta: data.cliente_privato_citta,
            note: data.cliente_privato_note,
          });
          clientePrivatoId = nuovoCliente.id;
          console.log("Cliente salvato con ID:", clientePrivatoId);
          toast.success("Cliente salvato in anagrafica");
        } catch (error) {
          console.error("Errore creazione cliente:", error);
          toast.error("Errore nel salvataggio cliente");
          // Continua comunque con dati inline
        }
      }
      
      // 2. Se è stato selezionato un cliente esistente dall'anagrafica, recupera i dati
      if (data.tipo_cliente === 'privato' && clientePrivatoId && !clientePrivatoNome) {
        try {
          console.log("Recupero dati cliente esistente:", clientePrivatoId);
          const { data: cliente, error } = await supabase
            .from('clienti_privati')
            .select('nome, cognome')
            .eq('id', clientePrivatoId)
            .single();
          
          if (error) throw error;
          if (cliente) {
            clientePrivatoNome = cliente.nome;
            clientePrivatoCognome = cliente.cognome;
            console.log("Dati cliente recuperati:", { nome: clientePrivatoNome, cognome: clientePrivatoCognome });
          }
        } catch (error) {
          console.error("Errore recupero cliente:", error);
        }
      }

      const servizioData = {
        tipo_cliente: data.tipo_cliente,
        created_by: user.id,
        
        // Campi azienda (solo se tipo = azienda)
        azienda_id: data.tipo_cliente === 'azienda' ? data.azienda_id : null,
        referente_id: data.tipo_cliente === 'azienda' ? (data.referente_id || null) : null,
        
        // Campi cliente privato (solo se tipo = privato)
        cliente_privato_id: data.tipo_cliente === 'privato' ? clientePrivatoId : null,
        cliente_privato_nome: data.tipo_cliente === 'privato' ? clientePrivatoNome : null,
        cliente_privato_cognome: data.tipo_cliente === 'privato' ? clientePrivatoCognome : null,
        
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
        incasso_previsto: data.incasso_previsto || null,
        iva: data.iva || null,
        applica_provvigione: data.applica_provvigione,
        consegna_contanti_a: data.metodo_pagamento === "Contanti" ? data.consegna_contanti_a : null,
        note: data.note || null,
      };
      
      console.log("Dati servizio da salvare:", servizioData);

      if (mode === 'edit' && servizioId) {
        console.log("Aggiornamento servizio ID:", servizioId);
        const { error: servizioError } = await supabase.from("servizi").update(servizioData).eq('id', servizioId);
        if (servizioError) {
          console.error("Errore update servizio:", servizioError);
          throw servizioError;
        }

        // Gestisci passeggeri/email solo per aziende
        if (data.tipo_cliente === 'azienda') {
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
        }

        toast.success("Servizio aggiornato con successo!");
      } else {
        console.log("Creazione nuovo servizio...");
        const { data: servizio, error: servizioError } = await supabase.from("servizi").insert(servizioData).select().single();
        if (servizioError) {
          console.error("Errore insert servizio:", servizioError);
          console.error("Dettagli errore:", {
            message: servizioError.message,
            details: servizioError.details,
            hint: servizioError.hint,
            code: servizioError.code,
          });
          throw servizioError;
        }
        console.log("Servizio creato con successo:", servizio);

        // Gestisci passeggeri/email solo per aziende
        if (data.tipo_cliente === 'azienda') {
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
        }

        toast.success("Servizio creato con successo!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/servizi");
      }
    } catch (error: any) {
      console.error("=== ERRORE SUBMIT SERVIZIO ===");
      console.error("Errore completo:", error);
      
      let errorMessage = mode === 'edit' ? "Errore nell'aggiornamento" : "Errore nella creazione";
      
      // Estrai messaggio specifico da Supabase se disponibile
      if (error?.message) {
        errorMessage += ": " + error.message;
      }
      if (error?.details) {
        console.error("Dettagli errore:", error.details);
      }
      if (error?.hint) {
        console.error("Suggerimento:", error.hint);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log("=== FINE SUBMIT SERVIZIO ===");
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else navigate("/servizi");
  };

  return (
    <MainLayout>
    <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
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
        
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
          {isVeloce 
            ? 'Inserimento Veloce' 
            : mode === 'edit' 
              ? 'Modifica Servizio' 
              : 'Nuovo Servizio'}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {isVeloce
            ? 'Inserisci solo azienda, referente e note. Il resto viene salvato come bozza.'
            : mode === 'edit' 
              ? 'Modifica le informazioni del servizio' 
              : 'Compila i campi per creare un nuovo servizio'}
        </p>
      </div>

      {/* Form */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full sm:max-w-7xl">
          <div className="w-full space-y-4 sm:space-y-6 pb-20 sm:pb-0">
          
          {/* SEZIONE 0: Tipo Cliente */}
          <Card className="w-full p-3 sm:p-4 md:p-6 bg-muted/30">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Tipo Cliente</h2>
            </div>
            
            <Controller
              name="tipo_cliente"
              control={form.control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label className="font-medium">Seleziona Tipo Cliente</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full sm:w-[300px]">
                      <SelectValue placeholder="Seleziona tipo cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="azienda">Azienda</SelectItem>
                      <SelectItem value="privato">Cliente Privato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </Card>

          {/* SEZIONE 1: Azienda e Contatto (o Cliente Privato) */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              {watchTipoCliente === 'azienda' ? (
                <><Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><h2 className="text-base sm:text-lg font-semibold">Azienda e Contatto</h2></>
              ) : (
                <><User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><h2 className="text-base sm:text-lg font-semibold">Dati Cliente</h2></>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {watchTipoCliente === 'azienda' ? (
                <>
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
                </>
              ) : null}
            </div>
            
            {/* Cliente Privato Fields - usa componente dedicato */}
            {watchTipoCliente === 'privato' && (
              <div className="mt-4">
                <ClientePrivatoFields />
              </div>
            )}
            
            {/* Data e Orario per Cliente Privato */}
            {watchTipoCliente === 'privato' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
                {/* Data Servizio */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="data_servizio_privato" className="font-medium">
                    Data Servizio <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="data_servizio_privato"
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
                  <Label htmlFor="orario_servizio_privato" className="font-medium">
                    Orario <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="orario_servizio_privato"
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
              </div>
            )}
          </Card>

          {/* SEZIONE 2: Passeggeri - Solo per aziende e non in modalità veloce */}
          {!isVeloce && watchTipoCliente === 'azienda' && watchAziendaId && (
          <Card className="w-full p-3 sm:p-4 md:p-6">
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

                    <div className="flex items-start space-x-2 pt-2">
                      <Checkbox
                        id="salva_in_database"
                        checked={newPasseggero.salva_in_database}
                        onCheckedChange={(checked) =>
                          setNewPasseggero({ ...newPasseggero, salva_in_database: !!checked })
                        }
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="salva_in_database"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          💾 Salva in anagrafica permanente
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Se attivo, il passeggero sarà disponibile per servizi futuri
                        </p>
                      </div>
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
                      ) : isLoadingPasseggeri ? (
                        <p className="text-sm text-muted-foreground">
                          ⏳ Caricamento passeggeri...
                        </p>
                      ) : errorPasseggeri ? (
                        <p className="text-sm text-destructive">
                          ❌ Errore nel caricamento dei passeggeri. Riprova.
                        </p>
                      ) : passeggeri?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nessun passeggero disponibile. Creane uno con il pulsante sopra.
                        </p>
                      ) : (
                        passeggeri?.map((pass) => (
                          <div key={pass.id} className="flex items-center space-x-2 pl-0.5">
                            <Checkbox
                              checked={field.value.includes(pass.id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...field.value, pass.id]
                                  : field.value.filter(id => id !== pass.id);
                                field.onChange(newValue);
                              }}
                              className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                            />
                            <Label className="text-sm sm:text-base font-normal cursor-pointer">
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
          )}

          {/* SEZIONE 3: Percorso */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
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
                
                {/* Checkbox Usa Indirizzo Passeggero - Partenza */}
                {watchTipoCliente === 'azienda' && (
                  <Controller
                    name="usa_indirizzo_passeggero_partenza"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-4 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            id="usa_indirizzo_passeggero_partenza"
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked && passeggeroSelezionato) {
                                console.log('[Percorso] Auto-fill partenza:', passeggeroSelezionato);
                                form.setValue('indirizzo_presa', passeggeroSelezionato.indirizzo || '');
                                form.setValue('citta_presa', passeggeroSelezionato.localita || '');
                              } else if (!checked) {
                                form.setValue('indirizzo_presa', '');
                                form.setValue('citta_presa', '');
                              }
                            }}
                            disabled={!passeggeroSelezionato || !passeggeroSelezionato.indirizzo}
                          />
                          <div className="space-y-1 leading-none flex-1">
                            <label 
                              htmlFor="usa_indirizzo_passeggero_partenza" 
                              className="text-sm font-medium cursor-pointer"
                            >
                              🏠 Usa indirizzo del passeggero come punto di partenza
                            </label>
                            {!passeggeroSelezionato && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Seleziona prima un passeggero nella sezione Passeggeri
                              </p>
                            )}
                            {passeggeroSelezionato && !passeggeroSelezionato.indirizzo && (
                              <p className="text-xs text-orange-500 mt-1">
                                ⚠️ Il passeggero "{passeggeroSelezionato.nome_cognome}" non ha un indirizzo salvato
                              </p>
                            )}
                            {passeggeroSelezionato && passeggeroSelezionato.indirizzo && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ {passeggeroSelezionato.nome_cognome}: {passeggeroSelezionato.indirizzo}, {passeggeroSelezionato.localita}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                )}
                
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
                
                {/* Checkbox Usa Indirizzo Passeggero - Destinazione */}
                {watchTipoCliente === 'azienda' && (
                  <Controller
                    name="usa_indirizzo_passeggero_destinazione"
                    control={form.control}
                    render={({ field }) => (
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-4 p-3 rounded-lg bg-muted/30">
                        <div className="flex items-start space-x-3 flex-1">
                          <Checkbox
                            id="usa_indirizzo_passeggero_destinazione"
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked && passeggeroSelezionato) {
                                console.log('[Percorso] Auto-fill destinazione:', passeggeroSelezionato);
                                form.setValue('indirizzo_destinazione', passeggeroSelezionato.indirizzo || '');
                                form.setValue('citta_destinazione', passeggeroSelezionato.localita || '');
                              } else if (!checked) {
                                form.setValue('indirizzo_destinazione', '');
                                form.setValue('citta_destinazione', '');
                              }
                            }}
                            disabled={!passeggeroSelezionato || !passeggeroSelezionato.indirizzo}
                          />
                          <div className="space-y-1 leading-none flex-1">
                            <label 
                              htmlFor="usa_indirizzo_passeggero_destinazione" 
                              className="text-sm font-medium cursor-pointer"
                            >
                              🏠 Usa indirizzo del passeggero come destinazione
                            </label>
                            {!passeggeroSelezionato && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Seleziona prima un passeggero nella sezione Passeggeri
                              </p>
                            )}
                            {passeggeroSelezionato && !passeggeroSelezionato.indirizzo && (
                              <p className="text-xs text-orange-500 mt-1">
                                ⚠️ Il passeggero "{passeggeroSelezionato.nome_cognome}" non ha un indirizzo salvato
                              </p>
                            )}
                            {passeggeroSelezionato && passeggeroSelezionato.indirizzo && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ {passeggeroSelezionato.nome_cognome}: {passeggeroSelezionato.indirizzo}, {passeggeroSelezionato.localita}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  />
                )}
                
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

          {/* SEZIONE 4: Dettagli Economici - nascosto in modalità veloce */}
          {!isVeloce && (
          <Card className="w-full p-3 sm:p-4 md:p-6">
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
                          {metodiPagamento.length === 0 ? (
                            <SelectItem value="placeholder" disabled>
                              Configura metodi in Impostazioni
                            </SelectItem>
                          ) : (
                            metodiPagamento.map((metodo: any) => (
                              <SelectItem key={metodo.id || metodo.nome} value={metodo.nome}>
                                {metodo.nome}
                              </SelectItem>
                            ))
                          )}
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

                {mostraIva && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="iva" className="font-medium">Aliquota IVA (%)</Label>
                    <Controller
                      name="iva"
                      control={form.control}
                      render={({ field }) => (
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value?.toString()}
                        >
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Seleziona IVA" />
                          </SelectTrigger>
                          <SelectContent>
                            {aliquoteIva.map((aliquota: number) => (
                              <SelectItem key={aliquota} value={aliquota.toString()}>
                                {aliquota}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                )}

                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="incasso_previsto" className="font-medium">
                    {mostraIva ? "Incasso netto Previsto (€)" : "Incasso Previsto (€)"}
                  </Label>
                  <Controller
                    name="incasso_previsto"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="incasso_previsto"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="text-base"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? null : parseFloat(e.target.value);
                          field.onChange(val);
                        }}
                      />
                    )}
                  />
                </div>

                {/* Importo da Incassare - Solo se IVA applicabile */}
                {mostraIva && watchIncassoPrevisto !== null && watchIncassoPrevisto !== undefined && watchIva !== undefined && (
                  <div className="space-y-1.5 sm:space-y-2 md:col-span-2 lg:col-span-1">
                    <Label htmlFor="importo_totale_calcolato" className="font-medium">
                      Importo da Incassare (con IVA)
                    </Label>
                    <Controller
                      name="importo_totale_calcolato"
                      control={form.control}
                      render={({ field }) => {
                        const netto = Number(watchIncassoPrevisto) || 0;
                        const percentualeIva = Number(watchIva) || 0;
                        const importoIva = netto * (percentualeIva / 100);
                        const totale = field.value || 0;
                        
                        return (
                          <div className="space-y-1">
                            <div className="relative">
                              <Input
                                id="importo_totale_calcolato"
                                type="text"
                                value={totale ? `€ ${totale.toFixed(2)}` : '€ 0.00'}
                                disabled
                                className="bg-muted/50 font-semibold text-lg border-2 border-primary/20 text-base"
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:block">
                                (€{netto.toFixed(2)} + €{importoIva.toFixed(2)} IVA)
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground sm:hidden">
                              Netto: €{netto.toFixed(2)} + IVA {percentualeIva}%: €{importoIva.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground hidden sm:block">
                              Calcolato automaticamente: Netto + IVA {percentualeIva}%
                            </p>
                          </div>
                        );
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Checkbox Provvigione */}
              <div className="flex items-center space-x-2 pl-0.5 mt-4">
                <Controller
                  name="applica_provvigione"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5"
                    />
                  )}
                />
                <Label className="text-sm sm:text-base cursor-pointer">Applica Provvigione</Label>
              </div>
            </div>
          </Card>
          )}

          {/* SEZIONE 5: Assegnazione - nascosto in modalità veloce */}
          {!isVeloce && (
          <Card className="w-full p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Assegnazione (Opzionale)</h2>
            </div>
            
            <div className="space-y-4">
              {/* Checkbox Conducente Esterno */}
              <div className="flex items-center space-x-2 pl-0.5 mt-4">
                <Controller
                  name="conducente_esterno"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-5 w-5 flex-shrink-0 sm:h-5 sm:w-5"
                    />
                  )}
                />
                <Label className="text-sm sm:text-base cursor-pointer">Conducente Esterno</Label>
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
          )}

          {/* SEZIONE 6: Note */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
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

          {/* SEZIONE 7: Email Notifiche - Solo per aziende e non in modalità veloce */}
          {!isVeloce && watchTipoCliente === 'azienda' && watchAziendaId && (
          <Card className="w-full p-3 sm:p-4 md:p-6">
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
                        <div key={email.id} className="flex items-center space-x-2 pl-0.5">
                          <Checkbox
                            checked={field.value.includes(email.id)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, email.id]
                                : field.value.filter(id => id !== email.id);
                              field.onChange(newValue);
                            }}
                            className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                          />
                          <Label className="text-sm sm:text-base font-normal cursor-pointer">
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
          )}

        </div>

        {/* Footer Buttons - Sticky Mobile */}
        <div className="sticky inset-x-0 bottom-0 bg-background border-t mt-6 sm:mt-8 pt-3 sm:pt-6 pb-3 sm:pb-0 sm:relative sm:bg-transparent z-10 shadow-lg sm:shadow-none">
          <div className="px-3 sm:px-0">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[200px] order-1 sm:order-2"
              size="lg"
            >
              {isVeloce 
                ? (isSubmitting ? "Salvataggio..." : "Salva bozza")
                : isSubmitting 
                  ? (mode === 'edit' ? "Salvataggio..." : "Creazione...") 
                  : (mode === 'edit' ? "Salva Modifiche" : "Crea Servizio")}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto order-2 sm:order-1"
              size="lg"
            >
              Annulla
            </Button>
            </div>
          </div>
        </div>
      </form>
      </FormProvider>
    </div>
    </MainLayout>
  );
};
