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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  ChevronUp,
  UserCircle,
  X,
  Loader2
} from "lucide-react";
import { ClientePrivatoFields } from "@/components/servizi/form-fields/ClientePrivatoFields";
import { createClientePrivato } from "@/lib/api/clientiPrivati/createClientePrivato";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AziendaSelectField } from "@/components/servizi/AziendaSelectField";
import { ReferenteSelectField } from '@/components/servizi/ReferenteSelectField';
import { PasseggeroForm } from "@/components/servizi/passeggeri/PasseggeroForm";
import { calculateServizioStato } from '@/utils/servizioValidation';

// Schema per modalità veloce - tipo cliente selezionabile
const servizioSchemaVeloce = z.object({
  tipo_cliente: z.enum(['azienda', 'privato']),
  azienda_id: z.string().optional(),
  referente_id: z.string().optional().nullable(),
  // Campi privato opzionali
  cliente_privato_id: z.string().optional().nullable(),
  cliente_privato_nome: z.string().optional(),
  cliente_privato_cognome: z.string().optional(),
  cliente_privato_email: z.string().optional(),
  cliente_privato_telefono: z.string().optional(),
  cliente_privato_indirizzo: z.string().optional(),
  cliente_privato_citta: z.string().optional(),
  cliente_privato_note: z.string().optional(),
  data_servizio: z.string().optional(),
  orario_servizio: z.string().optional(),
  note: z.string().optional().nullable(),
  salva_cliente_anagrafica: z.boolean().default(false),
  numero_commessa: z.string().optional().nullable(),
  citta_presa: z.string().optional().nullable(),
  citta_destinazione: z.string().optional().nullable(),
  indirizzo_presa: z.string().optional(),
  indirizzo_destinazione: z.string().optional(),
  metodo_pagamento: z.string().optional(),
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
  passeggeri: z.array(z.any()).optional().default([]),
  email_notifiche_ids: z.array(z.string()).default([]),
  usa_indirizzo_passeggero_partenza: z.boolean().optional(),
  usa_indirizzo_passeggero_destinazione: z.boolean().optional(),
});

// Schema validazione completo
const servizioSchemaCompleto = z.object({
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
  passeggeri: z.array(z.any()).optional().default([]),
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
  // Validation: se privato → (cliente_privato_id OR almeno nome O cognome) required
  if (data.tipo_cliente === 'privato') {
    return (
      !!data.cliente_privato_id || 
      !!data.cliente_privato_nome || 
      !!data.cliente_privato_cognome
    );
  }
  return true;
}, {
  message: "Seleziona un cliente dall'anagrafica oppure inserisci almeno nome o cognome",
  path: ["cliente_privato_nome"]
});

type ServizioFormData = z.infer<typeof servizioSchemaCompleto>;

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
    resolver: zodResolver(isVeloce ? servizioSchemaVeloce : servizioSchemaCompleto),
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
      iva: 0, // ✅ Sarà popolato dall'aliquota di default via useEffect
      importo_totale_calcolato: null,
      conducente_esterno: false,
      applica_provvigione: false,
      passeggeri_ids: [],
      passeggeri: [],
      email_notifiche_ids: [],
      usa_indirizzo_passeggero_partenza: false,
      usa_indirizzo_passeggero_destinazione: false,
    },
  });

  const { formState: { errors } } = form;
  
  // Watch checkbox values for exclusive logic
  const watchUsaIndirizzoPartenza = form.watch('usa_indirizzo_passeggero_partenza');
  const watchUsaIndirizzoDestinazione = form.watch('usa_indirizzo_passeggero_destinazione');

  // Pre-popola form in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData && servizioId) {
      const loadData = async () => {
        try {
          // ✅ Usa i passeggeri già fetchati da ModificaServizioPage
          const passeggeriData = initialData.servizi_passeggeri || [];

          console.log('[ServizioCreaPage] Edit mode - Passeggeri da initialData:', {
            count: passeggeriData.length,
            data: passeggeriData
          });

          // Mantieni solo query email (elimina query passeggeri duplicata)
          const emailResult = await supabase
            .from('servizi_email_notifiche')
            .select('email_notifica_id')
            .eq('servizio_id', servizioId);

          console.log('[ServizioCreaPage] 🔵 Loading edit mode:', {
            referente_id: initialData.referente_id,
            referente_id_type: typeof initialData.referente_id,
            referente_id_is_null: initialData.referente_id === null,
            referente_id_is_undefined: initialData.referente_id === undefined,
            azienda_id: initialData.azienda_id,
            azienda_id_type: typeof initialData.azienda_id,
            mode: mode,
            servizioId: servizioId,
            initialData_keys: Object.keys(initialData)
          });
          
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
            // ✅ FIX CRITICO: Popola array 'passeggeri' con oggetti completi
            passeggeri: passeggeriData.map((sp: any) => ({
              id: sp.id,
              passeggero_id: sp.passeggero_id,
              nome_cognome: sp.nome_cognome_inline || sp.passeggeri?.nome_cognome || '',
              email: sp.email_inline || sp.passeggeri?.email || '',
              telefono: sp.telefono_inline || sp.passeggeri?.telefono || '',
              localita: sp.localita_inline || sp.passeggeri?.localita || '',
              indirizzo: sp.indirizzo_inline || sp.passeggeri?.indirizzo || '',
              orario_presa_personalizzato: sp.orario_presa_personalizzato,
              luogo_presa_personalizzato: sp.luogo_presa_personalizzato,
              destinazione_personalizzato: sp.destinazione_personalizzato,
              usa_indirizzo_personalizzato: sp.usa_indirizzo_personalizzato || false,
              salva_in_database: sp.salva_in_database !== false,
              is_existing: !!sp.passeggero_id,
            })) || [],
            email_notifiche_ids: emailResult.data?.map(r => r.email_notifica_id) || [],
            note: initialData.note || null,
          });
          
          console.log('[ServizioCreaPage] Form reset completato:', {
            passeggeri_count: form.getValues('passeggeri')?.length,
            passeggeri_data: form.getValues('passeggeri'),
            referente_id_form_value: form.getValues('referente_id'),
            referente_id_watch: form.watch('referente_id'),
            azienda_id_form_value: form.getValues('azienda_id'),
            all_form_values_keys: Object.keys(form.getValues())
          });
          
          // ✅ Carica passeggeri temporanei da DB (se presenti)
          const tempPasseggeriDaDB = passeggeriData
            .filter((sp: any) => !sp.salva_in_database && !sp.passeggero_id)
            .map((sp: any) => ({
              id: sp.id,
              nome_cognome: sp.nome_cognome_inline || '',
              email: sp.email_inline || '',
              telefono: sp.telefono_inline || '',
              localita: sp.localita_inline || '',
              indirizzo: sp.indirizzo_inline || '',
              orario_presa_personalizzato: sp.orario_presa_personalizzato,
              usa_indirizzo_personalizzato: sp.usa_indirizzo_personalizzato || false,
            })) || [];
          
          if (tempPasseggeriDaDB.length > 0) {
            setTempPasseggeri(tempPasseggeriDaDB);
            console.log('[ServizioCreaPage] Loaded temporary passengers for edit:', tempPasseggeriDaDB.length);
          }
          
        } catch (error) {
          console.error('[ServizioCreaPage] ❌ CRITICAL ERROR in loadData():', {
            error,
            error_message: error instanceof Error ? error.message : 'Unknown error',
            error_stack: error instanceof Error ? error.stack : undefined
          });
          
          toast.error('Errore nel caricamento dei dati del servizio');
        }
      };
      
      loadData();
    }
  }, [mode, initialData, servizioId, form]);

  const watchAziendaId = form.watch("azienda_id");
  const watchReferenteId = form.watch("referente_id");
  const watchConducenteEsterno = form.watch("conducente_esterno");
  const watchMetodoPagamento = form.watch("metodo_pagamento");
  const watchTipoCliente = form.watch("tipo_cliente");
  const watchIncassoPrevisto = form.watch("incasso_previsto");
  const watchClientePrivatoNome = form.watch("cliente_privato_nome");
  const watchClientePrivatoCognome = form.watch("cliente_privato_cognome");
  const watchClientePrivatoEmail = form.watch("cliente_privato_email");
  const watchClientePrivatoTelefono = form.watch("cliente_privato_telefono");
  const watchClientePrivatoIndirizzo = form.watch("cliente_privato_indirizzo");
  const watchClientePrivatoCitta = form.watch("cliente_privato_citta");
  
  // State per passeggeri temporanei
  const [tempPasseggeri, setTempPasseggeri] = useState<any[]>([]);
  const [isNewPasseggeroFormOpen, setIsNewPasseggeroFormOpen] = useState(false);
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

  // ✅ Trova aliquota IVA di default
  const aliquotaIvaDefault = useMemo(() => {
    if (!Array.isArray(impostazioniData?.aliquote_iva)) return 22;
    const aliquoteArray = impostazioniData.aliquote_iva as Array<{ percentuale: number; is_default?: boolean }>;
    const defaultAliquota = aliquoteArray.find(a => a.is_default === true);
    return defaultAliquota ? Number(defaultAliquota.percentuale) : 22;
  }, [impostazioniData?.aliquote_iva]);

  // ✅ Imposta aliquota IVA di default quando le impostazioni sono caricate (solo in modalità creazione)
  useEffect(() => {
    if (mode === 'create' && aliquotaIvaDefault) {
      const currentIva = form.getValues('iva');
      // Applica default solo se IVA è 0 o non impostata
      if (currentIva === 0 || currentIva === null || currentIva === undefined) {
        form.setValue('iva', aliquotaIvaDefault, { shouldValidate: false });
        console.log('[ServizioCreaPage] ✅ Applied default IVA on mount:', aliquotaIvaDefault);
      }
    }
  }, [aliquotaIvaDefault, mode, form]);

  // ✅ Applica aliquota IVA di default quando cambia il metodo di pagamento
  useEffect(() => {
    // Solo in modalità creazione
    if (mode !== 'create') return;
    
    // Solo se il metodo di pagamento è valido e non è "da_definire"
    if (!watchMetodoPagamento || watchMetodoPagamento === 'da_definire') return;
    
    // Trova configurazione del metodo selezionato
    const metodo = metodiPagamento?.find((m: any) => m.nome === watchMetodoPagamento);
    
    if (!metodo) return;
    
    // Se il metodo prevede IVA, applica l'aliquota di default
    if ((metodo as any).iva_applicabile === true) {
      const currentIva = form.getValues('iva');
      // Applica default solo se IVA non è stata modificata manualmente (è ancora 0)
      if (currentIva === 0 || currentIva === null || currentIva === undefined) {
        form.setValue('iva', aliquotaIvaDefault, { shouldValidate: false });
        console.log('[ServizioCreaPage] ✅ Applied default IVA for payment method:', {
          method: watchMetodoPagamento,
          iva: aliquotaIvaDefault
        });
      }
    } else {
      // Se il metodo NON prevede IVA, imposta a 0
      form.setValue('iva', 0, { shouldValidate: false });
      console.log('[ServizioCreaPage] ⚠️ Set IVA to 0 for non-VAT payment method:', watchMetodoPagamento);
    }
  }, [watchMetodoPagamento, metodiPagamento, aliquotaIvaDefault, mode, form]);

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
      if (!watchAziendaId) return [];
      
      console.log('[ServizioCreaPage] 🔍 Fetching passeggeri:', {
        azienda_id: watchAziendaId
      });
      
      const query = supabase
        .from("passeggeri")
        .select("id, nome_cognome, email, indirizzo, localita, created_by_referente_id")
        .eq("azienda_id", watchAziendaId)
        .eq("tipo", "rubrica")
        .order("nome_cognome");
      
      const { data, error } = await query;
      
      if (error) {
        console.error('[ServizioCreaPage] ❌ Error fetching passeggeri:', error);
        throw error;
      }
      
      console.log('[ServizioCreaPage] 📊 Passeggeri fetched:', {
        count: data?.length || 0,
        passengers: data?.map(p => ({
          id: p.id,
          nome: p.nome_cognome,
          created_by_referente_id: p.created_by_referente_id
        }))
      });
      
      return data;
    },
    enabled: !!watchAziendaId && watchTipoCliente === 'azienda',
  });


  // Auto-espandi sezione passeggeri su mobile se ci sono passeggeri disponibili
  useEffect(() => {
    if (Array.isArray(passeggeri) && passeggeri.length > 0) {
      setIsPasseggeriOpen(true);
    }
  }, [passeggeri]);

  // Passeggero selezionato per indirizzo (usa useMemo per performance)
  const watchPasseggeriIds = form.watch("passeggeri_ids");
  const passeggeroSelezionato = useMemo(() => {
    if (!watchPasseggeriIds || watchPasseggeriIds.length === 0) return null;
    if (!Array.isArray(passeggeri)) return null;
    return passeggeri.find(p => p.id === watchPasseggeriIds[0]) || null;
  }, [passeggeri, watchPasseggeriIds]);

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
      if (!newPasseggero.salva_in_database) {
        // ✅ Passeggero temporaneo - NON salvare in DB
        console.log('[ServizioCreaPage] Creating temporary passenger:', newPasseggero.nome_cognome);
        
        const tempId = `temp-${Date.now()}`;
        const tempPasseggero = {
          id: tempId,
          passeggero_id: null,
          nome_cognome: newPasseggero.nome_cognome,
          email: newPasseggero.email || "",
          telefono: newPasseggero.telefono || "",
          localita: newPasseggero.localita || "",
          indirizzo: newPasseggero.indirizzo || "",
          salva_in_database: false,
          is_existing: false,
          usa_indirizzo_personalizzato: false,
        };
        
        setTempPasseggeri(prev => [...prev, tempPasseggero]);
        
        console.log('[ServizioCreaPage] Temporary passenger added. Total temp passengers:', tempPasseggeri.length + 1);
        
        // Reset form
        setNewPasseggero({
          nome_cognome: "",
          email: "",
          telefono: "",
          localita: "",
          indirizzo: "",
          salva_in_database: true,
        });
        
        setIsNewPasseggeroFormOpen(false);
        toast.success("Passeggero temporaneo aggiunto (solo questo servizio)");
      } else {
        // ✅ Passeggero permanente - salva in DB
        console.log('[ServizioCreaPage] Creating permanent passenger:', newPasseggero.nome_cognome);
        
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
        queryClient.invalidateQueries({ queryKey: ["passeggeri", watchAziendaId, watchReferenteId] });

        // Reset form
        setNewPasseggero({
          nome_cognome: "",
          email: "",
          telefono: "",
          localita: "",
          indirizzo: "",
          salva_in_database: true,
        });

        setIsNewPasseggeroFormOpen(false);
        setIsPasseggeriOpen(true);

        toast.success("Passeggero aggiunto alla rubrica!");
      }
    } catch (error) {
      console.error('[ServizioCreaPage] Error creating passenger:', error);
      toast.error("Errore nella creazione del passeggero");
    } finally {
      setIsAddingPasseggero(false);
    }
  };

  // Rimuovi passeggero temporaneo
  const handleRemoveTempPasseggero = (tempId: string) => {
    setTempPasseggeri(prev => prev.filter(p => p.id !== tempId));
    toast.success("Passeggero rimosso");
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

      // Ottieni il profilo dell'utente per determinare il ruolo
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

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
          toast.success("Cliente salvato in anagrafica");
        } catch (error) {
          toast.error("Errore nel salvataggio cliente");
        }
      }
      
      // 2. Se è stato selezionato un cliente esistente dall'anagrafica, recupera i dati
      if (data.tipo_cliente === 'privato' && clientePrivatoId && !clientePrivatoNome) {
        try {
          const { data: cliente, error } = await supabase
            .from('clienti_privati')
            .select('nome, cognome')
            .eq('id', clientePrivatoId)
            .single();
          
          if (error) throw error;
          if (cliente) {
            clientePrivatoNome = cliente.nome;
            clientePrivatoCognome = cliente.cognome;
          }
        } catch (error) {
          // Silently fail
        }
      }

      // Determina lo stato in base al ruolo e alla modalità
      let statoServizio: any;

      if (mode === 'edit') {
        // In modifica, mantieni stato esistente o default
        statoServizio = initialData?.stato || "da_assegnare";
      } else if (userProfile?.role === 'cliente') {
        // I clienti creano servizi con stato "richiesta_cliente"
        statoServizio = "richiesta_cliente";
      } else {
        // ✅ FIX: Stato basato su TIPO DI INSERIMENTO, non su validazione campi
        
        // Controlla se c'è un autista assegnato
        const hasDriver = Boolean(
          data.assegnato_a || 
          (data.conducente_esterno && data.conducente_esterno_id)
        );
        
        if (formMode === 'veloce') {
          // Inserimento veloce → sempre bozza
          statoServizio = 'bozza';
        } else {
          // Inserimento completo → basato su presenza autista
          statoServizio = hasDriver ? 'assegnato' : 'da_assegnare';
        }
        
        console.log('🎯 Stato determinato:', {
          formMode,
          hasDriver,
          statoFinale: statoServizio
        });
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
        stato: statoServizio,
        assegnato_a: data.assegnato_a || null,
        conducente_esterno: data.conducente_esterno,
        conducente_esterno_id: data.conducente_esterno ? data.conducente_esterno_id : null,
        veicolo_id: data.veicolo_id || null,
        ore_effettive: data.ore_effettive ? parseFloat(data.ore_effettive) : null,
        ore_fatturate: data.ore_fatturate ? parseFloat(data.ore_fatturate) : null,
        incasso_previsto: data.incasso_previsto || null,
        // ⚠️ NON salvare campo IVA - deve essere calcolato dinamicamente dalle impostazioni
        // iva: data.iva || null,  // RIMOSSO
        applica_provvigione: data.applica_provvigione,
        consegna_contanti_a: data.metodo_pagamento === "Contanti" ? data.consegna_contanti_a : null,
        note: data.note || null,
      };

      if (mode === 'edit' && servizioId) {
        const { error: servizioError } = await supabase.from("servizi").update(servizioData).eq('id', servizioId);
        if (servizioError) throw servizioError;

        // Gestisci passeggeri/email solo per aziende
        if (data.tipo_cliente === 'azienda') {
          await supabase.from("servizi_passeggeri").delete().eq('servizio_id', servizioId);
          
          // ✅ Combina passeggeri permanenti e temporanei
          const passeggeriCompleti = [];
          
          // Passeggeri permanenti (da checkbox)
          if (data.passeggeri_ids.length > 0) {
            const permanenti = data.passeggeri_ids.map(pid => ({ 
              servizio_id: servizioId, 
              passeggero_id: pid,
              salva_in_database: Boolean(true),
              usa_indirizzo_personalizzato: Boolean(false),
            }));
            passeggeriCompleti.push(...permanenti);
          }
          
          // Passeggeri temporanei (da state)
          const temporanei = tempPasseggeri.map(tp => {
            const passeggeroData = {
              servizio_id: servizioId,
              passeggero_id: null,
              nome_cognome_inline: tp.nome_cognome,
              email_inline: tp.email || null,
              telefono_inline: tp.telefono || null,
              localita_inline: tp.localita || null,
              indirizzo_inline: tp.indirizzo || null,
              salva_in_database: Boolean(false),
              usa_indirizzo_personalizzato: Boolean(tp.usa_indirizzo_personalizzato ?? false),
              orario_presa_personalizzato: tp.orario_presa_personalizzato || null,
              luogo_presa_personalizzato: tp.luogo_presa_personalizzato || null,
              destinazione_personalizzato: tp.destinazione_personalizzato || null,
            };
            
            console.log('═══════════════════════════════════');
            console.log('🔍 [ServizioCreaPage EDIT] Temp passenger data:');
            console.log('usa_indirizzo_personalizzato:', passeggeroData.usa_indirizzo_personalizzato);
            console.log('typeof:', typeof passeggeroData.usa_indirizzo_personalizzato);
            console.log('Full data:', JSON.stringify(passeggeroData, null, 2));
            console.log('═══════════════════════════════════');
            
            return passeggeroData;
          });
          passeggeriCompleti.push(...temporanei);
          
          console.log('[ServizioCreaPage] Saving passengers (edit mode):', {
            permanenti: data.passeggeri_ids.length,
            temporanei: tempPasseggeri.length,
            totale: passeggeriCompleti.length,
            passeggeriCompleti: passeggeriCompleti
          });
          
          if (passeggeriCompleti.length > 0) {
            console.log('🔍 [ServizioCreaPage EDIT] Final insert data:', JSON.stringify(passeggeriCompleti, null, 2));
            const { error: passErr } = await supabase.from("servizi_passeggeri")
              .insert(passeggeriCompleti);
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
        const { data: servizio, error: servizioError } = await supabase.from("servizi").insert(servizioData).select().single();
        if (servizioError) throw servizioError;

        // Passeggeri dal form (useFieldArray)
        const passeggeriForm = data.passeggeri || [];
        
        // Prima di inserire i link, aggiorna i passeggeri esistenti nella rubrica permanente
        let passeggeriAggiornati = 0;
        if (passeggeriForm.length > 0) {
          for (const p of passeggeriForm) {
            // Se è un passeggero esistente E ha salva_in_database = true
            if (p.is_existing && p.salva_in_database && p.id) {
              console.log(`[ServizioCreaPage] 🔄 Aggiornamento passeggero esistente: ${p.nome_cognome}`, {
                passeggero_id: p.id,
                dati: {
                  nome_cognome: p.nome_cognome,
                  nome: p.nome,
                  cognome: p.cognome,
                  email: p.email,
                  telefono: p.telefono,
                  localita: p.localita,
                  indirizzo: p.indirizzo,
                }
              });
              
              // Aggiorna la tabella passeggeri con i nuovi dati
              const { error: updateError } = await supabase
                .from('passeggeri')
                .update({
                  nome_cognome: p.nome_cognome || null,
                  nome: p.nome || null,
                  cognome: p.cognome || null,
                  email: p.email || null,
                  telefono: p.telefono || null,
                  localita: p.localita || null,
                  indirizzo: p.indirizzo || null,
                })
                .eq('id', p.id);
              
              if (updateError) {
                console.error('[ServizioCreaPage] ❌ Errore aggiornamento passeggero:', updateError);
                toast.warning(`Impossibile aggiornare ${p.nome_cognome || 'passeggero'}`);
              } else {
                console.log(`[ServizioCreaPage] ✅ Passeggero ${p.nome_cognome} aggiornato in anagrafica permanente`);
                passeggeriAggiornati++;
              }
            }
          }
        }
        
        const passeggeriCompleti = [];
        
        // Mappa passeggeri dal form a formato insert
        if (passeggeriForm.length > 0) {
          const passeggeriToInsert = passeggeriForm.map(p => {
      const passeggeroData = {
        servizio_id: servizio.id,
        passeggero_id: p.id || null,
        nome_cognome_inline: p.nome_cognome || null,
        email_inline: p.email || null,
        telefono_inline: p.telefono || null,
        localita_inline: p.localita || null,
        indirizzo_inline: p.indirizzo || null,
        
        // FIX: salva_in_database basato su presenza passeggero_id
        salva_in_database: Boolean(p.id),  // true se ha ID, false se temporaneo
        
        usa_indirizzo_personalizzato: Boolean(p.usa_indirizzo_personalizzato ?? false),
        orario_presa_personalizzato: p.orario_presa_personalizzato || null,
        luogo_presa_personalizzato: p.luogo_presa_personalizzato || null,
        destinazione_personalizzato: p.destinazione_personalizzato || null,
      };
            
            return passeggeroData;
          });
          
          passeggeriCompleti.push(...passeggeriToInsert);
        }
        
        // Insert passeggeri se ci sono
        if (passeggeriCompleti.length > 0) {
          const { error: passErr } = await supabase.from("servizi_passeggeri")
            .insert(passeggeriCompleti);
          
          if (passErr) {
            console.error('Error inserting passengers:', passErr);
            toast.warning('Servizio creato ma errore nel salvare passeggeri');
          }
        }

        // Email notifiche solo per aziende
        if (data.tipo_cliente === 'azienda' && data.email_notifiche_ids?.length > 0) {
          const { error: emailErr } = await supabase.from("servizi_email_notifiche")
            .insert(data.email_notifiche_ids.map(eid => ({ servizio_id: servizio.id, email_notifica_id: eid })));
          if (emailErr) throw emailErr;
        }

        toast.success("Servizio creato con successo!");
        
        // Toast aggiuntivo se ci sono stati aggiornamenti all'anagrafica
        if (passeggeriAggiornati > 0) {
          toast.success(
            `${passeggeriAggiornati} ${passeggeriAggiornati === 1 ? 'passeggero aggiornato' : 'passeggeri aggiornati'} in anagrafica`,
            { duration: 3000 }
          );
        }
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/servizi");
      }
    } catch (error: any) {
      let errorMessage = mode === 'edit' ? "Errore nell'aggiornamento" : "Errore nella creazione";
      
      if (error?.message) {
        errorMessage += ": " + error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
          <div className="w-full space-y-4 sm:space-y-6">
          
          {/* SEZIONE 0: Tipo Cliente - nascosto in modalità veloce */}
          {!isVeloce && (
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
          )}

          {/* SEZIONE 1: Azienda e Contatto (o Cliente Privato) */}
          <Card className="w-full p-3 sm:p-4 md:p-6">
            {/* Tipo Cliente Selector - Solo in modalità veloce */}
            {isVeloce && (
              <div className="mb-4">
                <Label className="font-medium mb-2 block">Tipo Cliente</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={watchTipoCliente === 'azienda' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => form.setValue('tipo_cliente', 'azienda')}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Azienda
                  </Button>
                  <Button
                    type="button"
                    variant={watchTipoCliente === 'privato' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => form.setValue('tipo_cliente', 'privato')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Privato
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              {watchTipoCliente === 'azienda' ? (
                <><Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><h2 className="text-base sm:text-lg font-semibold">Azienda e Contatto</h2></>
              ) : (
                <><User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><h2 className="text-base sm:text-lg font-semibold">Dati Cliente</h2></>
              )}
            </div>
            
            <div className={isVeloce ? "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"}>
              {watchTipoCliente === 'azienda' ? (
                <>
              {/* Azienda */}
              <AziendaSelectField />

              {/* Referente */}
              <ReferenteSelectField aziendaId={watchAziendaId || ''} />

              {/* Data Servizio */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="data_servizio" className="font-medium">
                  Data Servizio {!isVeloce && <span className="text-destructive">*</span>}
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
                  Orario {!isVeloce && <span className="text-destructive">*</span>}
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

              {/* Numero Commessa - nascosto in modalità veloce */}
              {!isVeloce && (
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="numero_commessa" className="font-medium">Numero Commessa</Label>
                <Input
                  id="numero_commessa"
                  placeholder="Opzionale: ES-2024-001"
                  className="text-base"
                  {...form.register("numero_commessa")}
                />
              </div>
              )}
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

          {/* SEZIONE 2: Passeggeri */}
          {!isVeloce && (
            (watchTipoCliente === 'azienda' && watchAziendaId) ||
            watchTipoCliente === 'privato'
          ) && (
            <PasseggeroForm 
              tipo_cliente={watchTipoCliente}
              clientePrivatoData={
                watchTipoCliente === 'privato' && 
                watchClientePrivatoNome && 
                watchClientePrivatoCognome 
                  ? {
                      nome: watchClientePrivatoNome,
                      cognome: watchClientePrivatoCognome,
                      email: watchClientePrivatoEmail || '',
                      telefono: watchClientePrivatoTelefono || '',
                      indirizzo: watchClientePrivatoIndirizzo || '',
                      citta: watchClientePrivatoCitta || ''
                    }
                  : undefined
              }
            />
          )}

          {/* SEZIONE 3: Percorso - nascosto in modalità veloce */}
          {!isVeloce && (
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
                {watchTipoCliente === 'azienda' && !watchUsaIndirizzoDestinazione && (
                  <Controller
                    name="usa_indirizzo_passeggero_partenza"
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="usa_indirizzo_passeggero_partenza"
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue('usa_indirizzo_passeggero_destinazione', false);
                                if (passeggeroSelezionato) {
                                  form.setValue('indirizzo_presa', passeggeroSelezionato.indirizzo || '');
                                  form.setValue('citta_presa', passeggeroSelezionato.localita || '');
                                }
                              } else {
                                form.setValue('indirizzo_presa', '');
                                form.setValue('citta_presa', '');
                              }
                            }}
                            disabled={!passeggeroSelezionato || !passeggeroSelezionato.indirizzo}
                          />
                          <label 
                            htmlFor="usa_indirizzo_passeggero_partenza" 
                            className="text-sm cursor-pointer leading-none"
                          >
                            Usa indirizzo del passeggero
                          </label>
                        </div>
                        {passeggeroSelezionato && !passeggeroSelezionato.indirizzo && (
                          <p className="text-xs text-destructive ml-6">
                            Il passeggero non ha un indirizzo salvato
                          </p>
                        )}
                        {passeggeroSelezionato && passeggeroSelezionato.indirizzo && field.value && (
                          <p className="text-xs text-muted-foreground ml-6">
                            {passeggeroSelezionato.indirizzo}, {passeggeroSelezionato.localita}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
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
                {watchTipoCliente === 'azienda' && !watchUsaIndirizzoPartenza && (
                  <Controller
                    name="usa_indirizzo_passeggero_destinazione"
                    control={form.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="usa_indirizzo_passeggero_destinazione"
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue('usa_indirizzo_passeggero_partenza', false);
                                if (passeggeroSelezionato) {
                                  form.setValue('indirizzo_destinazione', passeggeroSelezionato.indirizzo || '');
                                  form.setValue('citta_destinazione', passeggeroSelezionato.localita || '');
                                }
                              } else {
                                form.setValue('indirizzo_destinazione', '');
                                form.setValue('citta_destinazione', '');
                              }
                            }}
                            disabled={!passeggeroSelezionato || !passeggeroSelezionato.indirizzo}
                          />
                          <label 
                            htmlFor="usa_indirizzo_passeggero_destinazione" 
                            className="text-sm cursor-pointer leading-none"
                          >
                            Usa indirizzo del passeggero
                          </label>
                        </div>
                        {passeggeroSelezionato && !passeggeroSelezionato.indirizzo && (
                          <p className="text-xs text-destructive ml-6">
                            Il passeggero non ha un indirizzo salvato
                          </p>
                        )}
                        {passeggeroSelezionato && passeggeroSelezionato.indirizzo && field.value && (
                          <p className="text-xs text-muted-foreground ml-6">
                            {passeggeroSelezionato.indirizzo}, {passeggeroSelezionato.localita}
                          </p>
                        )}
                      </div>
                    )}
                  />
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4">
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
          )}

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
                          value={field.value !== null && field.value !== undefined ? String(field.value) : undefined}
                        >
                          <SelectTrigger className="text-base" key={`iva-${field.value}`}>
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
          {(isVeloce || !isVeloce) && (
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
          )}

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
        <div className="sticky inset-x-0 bottom-0 bg-background border-t mt-6 sm:mt-8 pt-3 sm:pt-6 pb-20 sm:pb-0 sm:relative sm:bg-transparent z-10 shadow-lg sm:shadow-none">
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
