
import { Azienda, UserRole } from "@/lib/types";

export type MetodoPagamento = 'Contanti' | 'Carta' | 'Bonifico';
export type StatoServizio = 'da_assegnare' | 'assegnato' | 'completato' | 'annullato';

export interface Servizio {
  id: string;
  azienda_id: string;
  referente_id: string;
  numero_commessa?: string;
  data_servizio: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  stato: StatoServizio;
  created_at: string;
  created_by: string;
}

export interface Passeggero {
  id?: string;
  servizio_id: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  orario_presa: string;
  luogo_presa: string;
  usa_indirizzo_personalizzato: boolean;
  destinazione: string;
  created_at?: string;
}

export interface ServizioFormData {
  azienda_id: string;
  referente_id?: string;
  numero_commessa?: string;
  data_servizio: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  passeggeri: PasseggeroFormData[];
}

export interface PasseggeroFormData {
  id?: string;
  nome_cognome: string;
  email?: string;
  telefono?: string;
  orario_presa: string;
  luogo_presa: string;
  usa_indirizzo_personalizzato: boolean;
  destinazione: string;
}
