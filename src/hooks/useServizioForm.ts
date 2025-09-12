
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ServizioFormData, MetodoPagamento } from "@/lib/types/servizi";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export const servizioFormSchema = z.object({
  azienda_id: z.string().min(1, "Azienda obbligatoria"),
  referente_id: z.string().optional(), // Referente opzionale - può essere null
  numero_commessa: z.string().optional(),
  data_servizio: z.string().min(1, "Data servizio obbligatoria"),
  orario_servizio: z.string().min(1, "Orario servizio obbligatorio"),
  indirizzo_presa: z.string().min(1, "Indirizzo di presa obbligatorio"),
  indirizzo_destinazione: z.string().min(1, "Indirizzo di destinazione obbligatorio"),
  citta_presa: z.string().optional(),
  citta_destinazione: z.string().optional(),
  metodo_pagamento: z.string({
    required_error: "Metodo di pagamento obbligatorio",
  }),
  note: z.string().optional(),
  veicolo_id: z.string().optional(),
  ore_effettive: z.number().min(0).optional(),
  ore_fatturate: z.number().min(0).optional(),
  applica_provvigione: z.boolean().default(false),
  email_notifiche: z.array(z.string()).default([]),
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
});

export function useServizioForm() {
  const { profile } = useAuth();
  
  const form = useForm<ServizioFormData>({
    resolver: zodResolver(servizioFormSchema),
    defaultValues: {
      azienda_id: "",
      referente_id: profile?.id || "",
      numero_commessa: "",
      data_servizio: new Date().toISOString().split("T")[0],
      orario_servizio: "12:00",
      indirizzo_presa: "",
      indirizzo_destinazione: "",
      citta_presa: "",
      citta_destinazione: "",
      metodo_pagamento: "", // Verrà impostato dopo aver caricato le impostazioni
      note: "",
      veicolo_id: "",
      ore_effettive: undefined,
      ore_fatturate: undefined,
      applica_provvigione: false,
      email_notifiche: [],
      passeggeri: [],
    },
  });

  // Se l'utente è un cliente, imposta l'azienda_id e referente_id di default
  useEffect(() => {
    if (profile?.role === "cliente") {
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
