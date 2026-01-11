
import { Azienda, UserRole } from "@/lib/types";

// Cambio da tipo aliasato a stringa semplice per maggiore flessibilità
export type MetodoPagamento = string;
export type StatoServizio = 'richiesta_cliente' | 'bozza' | 'da_assegnare' | 'assegnato' | 'completato' | 'annullato' | 'non_accettato' | 'consuntivato';

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
  incasso_previsto?: number; // LORDO (con IVA)
  incasso_netto_previsto?: number | null; // NETTO (senza IVA) - inserito dall'utente
  iva?: number;
  // UNICO campo ore attivo
  ore_sosta?: number; // Ore di attesa (stipendio + fattura)
  
  // Campi deprecati per backward compatibility (NON USARE)
  /** @deprecated Usa ore_sosta */ ore_lavorate?: number;
  /** @deprecated Usa ore_sosta */ ore_finali?: number;
  /** @deprecated Usa ore_sosta */ ore_effettive?: number;
  /** @deprecated Usa ore_sosta */ ore_fatturate?: number;
  /** @deprecated Usa ore_sosta */ ore_sosta_fatturate?: number;
  
  consegna_contanti_a?: string;
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

// Passeggero ora collegato ad azienda e creato da un referente (campo solo per tracking)
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
  created_by_referente_id?: string | null; // Solo per tracking storico, non per filtri
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
  usa_destinazione_personalizzata?: boolean;
  ordine_presa?: number;
  created_at?: string;
}

// Passeggero esteso con i dettagli del servizio per la visualizzazione
export interface PasseggeroConDettagli extends Passeggero {
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  destinazione_personalizzato?: string;
  usa_indirizzo_personalizzato: boolean;
  tipo?: 'permanente' | 'temporaneo';
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
  // Percorso - Partenza
  partenza_tipo?: 'personalizzato' | 'passeggero';
  partenza_passeggero_index?: number;
  indirizzo_presa: string;
  citta_presa?: string;
  // Percorso - Destinazione
  destinazione_tipo?: 'personalizzato' | 'passeggero';
  destinazione_passeggero_index?: number;
  indirizzo_destinazione: string;
  citta_destinazione?: string;
  metodo_pagamento: MetodoPagamento;
  note?: string;
  veicolo_id?: string;
  // NON includere campi ore in creazione servizio
  // ore_sosta viene inserito solo in consuntivazione
  applica_provvigione?: boolean;
  email_notifiche?: string[];
  passeggeri: PasseggeroFormData[];
  // Campi consuntivo (per modifica servizi già consuntivati)
  incasso_ricevuto?: number | null;
  ore_sosta?: number | null;
  km_totali?: number | null;
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
  // Campi presa intermedia
  ordine?: number;
  presa_tipo?: 'servizio' | 'passeggero' | 'personalizzato';
  presa_indirizzo_custom?: string;
  presa_citta_custom?: string;
  presa_orario?: string;
  presa_usa_orario_servizio?: boolean;
  // Campi destinazione intermedia
  destinazione_tipo?: 'servizio' | 'passeggero' | 'personalizzato';
  destinazione_indirizzo_custom?: string;
  destinazione_citta_custom?: string;
  // Legacy fields - manteniamo per compatibilità
  orario_presa_personalizzato?: string;
  luogo_presa_personalizzato?: string;
  usa_indirizzo_personalizzato?: boolean;
  destinazione_personalizzato?: string;
  is_existing?: boolean; // Flag per distinguere tra nuovo e esistente
  salva_in_database?: boolean; // Flag per salvare in anagrafica (default: true)
  azienda_id?: string; // Azienda di appartenenza
  referente_id?: string; // Referente che ha creato il passeggero (solo tracking)
  indirizzo_rubrica?: string; // Per visualizzazione
  localita_rubrica?: string; // Per visualizzazione
}

/**
 * Metodi di pagamento che NON richiedono gestione incasso da parte del dipendente
 * (il pagamento va direttamente all'azienda)
 */
const METODI_PAGAMENTO_DIRETTO_AZIENDA = [
  'bonifico bancario',
  'bonifico',
  'assegno',
] as const;

/**
 * Determina se un metodo di pagamento richiede gestione incasso dal dipendente/socio
 * Versione ROBUSTA con matching case-insensitive e trim
 * @param metodoPagamento - Il metodo di pagamento del servizio
 * @returns true se richiede gestione incasso (Contanti/Carta), false altrimenti (Bonifico/Assegno)
 */
export function richiedeGestioneIncasso(metodoPagamento?: string | null): boolean {
  if (!metodoPagamento) {
    console.warn('⚠️ metodoPagamento mancante, assume bonifico (safe default)');
    return false; // Safe default: assume bonifico
  }
  
  // Normalizza: lowercase + trim spazi
  const metodo = metodoPagamento.trim().toLowerCase();
  
  // Check se metodo è nella lista (exact match o contains dopo normalizzazione)
  const isDirettoAzienda = METODI_PAGAMENTO_DIRETTO_AZIENDA.some(
    m => metodo === m || metodo.includes(m)
  );
  
  const richiedeIncasso = !isDirettoAzienda;
  
  console.log('✅ richiedeGestioneIncasso:', {
    input: metodoPagamento,
    normalizzato: metodo,
    isDirettoAzienda,
    richiedeIncasso,
  });
  
  return richiedeIncasso;
}
