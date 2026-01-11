
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ServizioFormData, MetodoPagamento } from "@/lib/types/servizi";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export const servizioFormSchema = z.object({
  tipo_cliente: z.enum(['azienda', 'privato'], {
    required_error: "Seleziona il tipo di cliente"
  }).default('azienda'),
  azienda_id: z.string().optional(),
  referente_id: z.string().optional(),
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
  numero_commessa: z.string().optional(),
  data_servizio: z.string().min(1, "Data servizio obbligatoria"),
  orario_servizio: z.string().min(1, "Orario servizio obbligatorio"),
  indirizzo_presa: z.string().min(1, "Indirizzo di presa obbligatorio"),
  indirizzo_destinazione: z.string().min(1, "Indirizzo di destinazione obbligatorio"),
  citta_presa: z.string().optional(),
  citta_destinazione: z.string().optional(),
  // Campi per selezione percorso da passeggeri
  partenza_tipo: z.enum(['personalizzato', 'passeggero']).default('personalizzato'),
  partenza_passeggero_index: z.number().optional(),
  destinazione_tipo: z.enum(['personalizzato', 'passeggero']).default('personalizzato'),
  destinazione_passeggero_index: z.number().optional(),
  metodo_pagamento: z.string({
    required_error: "Metodo di pagamento obbligatorio",
  }),
  note: z.string().optional(),
  veicolo_id: z.string().optional(),
  // NON includere campi ore: vengono inseriti solo in consuntivazione
  applica_provvigione: z.boolean().default(false),
  email_notifiche: z.array(z.string()).default([]),
  // Campi consuntivo (per modifica servizi già consuntivati)
  incasso_ricevuto: z.number().nullable().optional(),
  ore_sosta: z.number().nullable().optional(),
  km_totali: z.number().nullable().optional(),
  passeggeri: z.array(
    z.object({
      nome_cognome: z.string().min(1, "Nome e cognome obbligatorio"),
      email: z.string().email("Email non valida").optional().or(z.literal('')),
      telefono: z.string().optional(),
      orario_presa_personalizzato: z.string().optional(),
      luogo_presa_personalizzato: z.string().optional(),
      usa_indirizzo_personalizzato: z.boolean().default(false),
      destinazione_personalizzato: z.string().optional(),
    })
  ).min(1, "Aggiungi almeno un passeggero"),
}).refine((data) => {
  // Validation: se azienda → azienda_id required
  if (data.tipo_cliente === 'azienda') {
    return !!data.azienda_id;
  }
  // Validation: se privato → (cliente_privato_id OR nome+cognome) required
  if (data.tipo_cliente === 'privato') {
    return (
      !!data.cliente_privato_id || 
      (!!data.cliente_privato_nome && !!data.cliente_privato_cognome)
    );
  }
  return true;
}, {
  message: "Seleziona un'azienda o inserisci i dati del cliente privato",
  path: ["azienda_id"]
});

export function useServizioForm() {
  const { profile } = useAuth();
  
  const form = useForm<ServizioFormData>({
    resolver: zodResolver(servizioFormSchema),
    defaultValues: {
      tipo_cliente: "azienda",
      azienda_id: "",
      referente_id: profile?.id || "",
      cliente_privato_id: null,
      cliente_privato_nome: "",
      cliente_privato_cognome: "",
      cliente_privato_email: "",
      cliente_privato_telefono: "",
      cliente_privato_indirizzo: "",
      cliente_privato_citta: "",
      cliente_privato_note: "",
      salva_cliente_anagrafica: false,
      numero_commessa: "",
      data_servizio: new Date().toISOString().split("T")[0],
      orario_servizio: "12:00",
      partenza_tipo: "personalizzato",
      partenza_passeggero_index: undefined,
      indirizzo_presa: "",
      citta_presa: "",
      destinazione_tipo: "personalizzato",
      destinazione_passeggero_index: undefined,
      indirizzo_destinazione: "",
      citta_destinazione: "",
      metodo_pagamento: "", // Verrà impostato dopo aver caricato le impostazioni
      note: "",
      veicolo_id: "",
      // NON includere campi ore: vengono inseriti solo in consuntivazione
      applica_provvigione: false,
      email_notifiche: [],
      passeggeri: [],
      // Campi consuntivo (null di default)
      incasso_ricevuto: null,
      ore_sosta: null,
      km_totali: null,
    },
  });

  // Se l'utente è un cliente, imposta tipo_cliente = azienda e i dati di default
  useEffect(() => {
    if (profile?.role === "cliente") {
      form.setValue("tipo_cliente", "azienda");
      if (profile?.azienda_id) {
        form.setValue("azienda_id", profile.azienda_id);
      }
      form.setValue("referente_id", profile?.id || "");
    }
  }, [profile, form]);

  return {
    form,
    profile
  };
}
