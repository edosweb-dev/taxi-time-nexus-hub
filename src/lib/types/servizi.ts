
import { Azienda, UserRole } from "@/lib/types";

// Cambio da tipo aliasato a stringa semplice per maggiore flessibilità
export type MetodoPagamento = string;
export type StatoServizio = 'bozza' | 'da_assegnare' | 'assegnato' | 'completato' | 'annullato' | 'non_accettato' | 'consuntivato';

// Tipo Cliente
export type TipoCliente = 'azienda' | 'privato';

// Cliente Privato
export interface ClientePrivato {
  id: string;
  nome: string;
  cognome: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  citta?: string;
  note?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Servizio {
  id: string;
  id_progressivo?: string;
  tipo_cliente: TipoCliente;
  azienda_id?: string;
  referente_id?: string;
  cliente_privato_id?: string | null;
  cliente_privato_nome?: string | null;
  cliente_privato_cognome?: string | null;
  numero_commessa?: string;
  data_servizio: string;
  orario_servizio: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  citta_presa?: string;
  citta_destinazione?: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  stato: StatoServizio;
  created_at: string;
  created_by: string;
  assegnato_a?: string;
  conducente_esterno?: boolean;
  conducente_esterno_nome?: string;
  conducente_esterno_email?: string;
  conducente_esterno_id?: string;
  firma_url?: string;
  firma_timestamp?: string;
  incasso_ricevuto?: number;
  incasso_previsto?: number;
  iva?: number;
  ore_lavorate?: number;
  ore_finali?: number;
  ore_effettive?: number;
  ore_fatturate?: number;
  consegna_contanti_a?: string;
  ore_sosta?: number;
  ore_sosta_fatturate?: number;
  km_totali?: number;
  veicolo_id?: string;
  applica_provvigione?: boolean;
  // Company information from join
  aziende?: {
    id: string;
    nome: string;
    firma_digitale_attiva?: boolean;
  };
  clienti_privati?: ClientePrivato;
}

// Passeggero ora collegato ad azienda e referente (senza più i dettagli specifici del servizio)
export interface Passeggero {
  id?: string;
  nome_cognome: string; // Mantenuto per compatibilità
  nome?: string;
  cognome?: string;
  localita?: string;
  indirizzo?: string;
  email?: string;
  telefono?: string;
  azienda_id: string;
  referente_id: string;
  created_at?: string;
}

// Collegamento tra servizio e passeggero con dettagli specifici del servizio
export interface ServizioPasseggero {
  id?: string;
  servizio_id: string;
  passeggero_id: string;
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  destinazione_personalizzato?: string;
  usa_indirizzo_personalizzato: boolean;
  created_at?: string;
}

// Passeggero esteso con i dettagli del servizio per la visualizzazione
export interface PasseggeroConDettagli extends Passeggero {
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  destinazione_personalizzato?: string;
  usa_indirizzo_personalizzato: boolean;
}

export interface ServizioFormData {
  tipo_cliente: TipoCliente;
  azienda_id?: string;
  referente_id?: string;
  cliente_privato_id?: string | null;
  cliente_privato_nome?: string;
  cliente_privato_cognome?: string;
  cliente_privato_email?: string;
  cliente_privato_telefono?: string;
  cliente_privato_indirizzo?: string;
  cliente_privato_citta?: string;
  cliente_privato_note?: string;
  salva_cliente_anagrafica?: boolean;
  numero_commessa?: string;
  data_servizio: string;
  orario_servizio: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  citta_presa?: string;
  citta_destinazione?: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  veicolo_id?: string;
  ore_effettive?: number;
  ore_fatturate?: number;
  applica_provvigione?: boolean;
  email_notifiche?: string[];
  passeggeri: PasseggeroFormData[];
}

export interface PasseggeroFormData {
  id?: string;
  passeggero_id?: string; // Per passeggeri esistenti
  nome_cognome: string; // Mantenuto per compatibilità
  nome?: string;
  cognome?: string;
  localita?: string;
  indirizzo?: string;
  email?: string;
  telefono?: string;
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  usa_indirizzo_personalizzato: boolean;
  destinazione_personalizzato?: string;
  is_existing?: boolean; // Flag per distinguere tra nuovo e esistente
  salva_in_database?: boolean; // Flag per salvare in anagrafica (default: true)
}
