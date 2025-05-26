
import { Azienda, UserRole } from "@/lib/types";

// Cambio da tipo aliasato a stringa semplice per maggiore flessibilità
export type MetodoPagamento = string;
export type StatoServizio = 'da_assegnare' | 'assegnato' | 'completato' | 'annullato' | 'non_accettato' | 'consuntivato';

export interface Servizio {
  id: string;
  azienda_id: string;
  referente_id: string;
  numero_commessa?: string;
  data_servizio: string;
  orario_servizio: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  stato: StatoServizio;
  created_at: string;
  created_by: string;
  assegnato_a?: string;
  conducente_esterno?: boolean;
  conducente_esterno_nome?: string;
  conducente_esterno_email?: string;
  firma_url?: string;
  firma_timestamp?: string;
  incasso_ricevuto?: number;
  incasso_previsto?: number;
  ore_lavorate?: number;
  ore_finali?: number;
  consegna_contanti_a?: string;
  veicolo_id?: string;
}

export interface Passeggero {
  id?: string;
  servizio_id: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  usa_indirizzo_personalizzato: boolean;
  destinazione_personalizzato?: string;
  created_at?: string;
}

export interface ServizioFormData {
  azienda_id: string;
  referente_id: string;
  numero_commessa?: string;
  data_servizio: string;
  orario_servizio: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  veicolo_id?: string;
  passeggeri: PasseggeroFormData[];
}

export interface PasseggeroFormData {
  id?: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  usa_indirizzo_personalizzato: boolean;
  destinazione_personalizzato?: string;
}
