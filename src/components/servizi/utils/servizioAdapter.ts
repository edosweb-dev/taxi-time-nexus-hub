import { Servizio } from "@/lib/types/servizi";
import { ServizioDettaglio, PasseggeroDettaglio } from "@/hooks/dipendente/useServizioDettaglio";
import { PasseggeroConDettagli } from "@/lib/types/servizi";

/**
 * Adapter per normalizzare ServizioDettaglio (dipendente) a Servizio (admin)
 * per compatibilità con i componenti esistenti
 */
export function adaptServizioDettaglioToServizio(dettaglio: ServizioDettaglio): Servizio {
  const result = {
    id: dettaglio.id,
    id_progressivo: dettaglio.id_progressivo,
    data_servizio: dettaglio.data_servizio,
    orario_servizio: dettaglio.orario_servizio,
    stato: dettaglio.stato as any,
    metodo_pagamento: dettaglio.metodo_pagamento as any,
    numero_commessa: dettaglio.numero_commessa,
    indirizzo_presa: dettaglio.indirizzo_presa,
    citta_presa: dettaglio.citta_presa,
    indirizzo_destinazione: dettaglio.indirizzo_destinazione,
    citta_destinazione: dettaglio.citta_destinazione,
    note: dettaglio.note,
    ore_effettive: dettaglio.ore_effettive,
    incasso_ricevuto: dettaglio.incasso_ricevuto,
    firma_url: dettaglio.firma_url,
    firma_timestamp: dettaglio.firma_timestamp,
    
    // Financial fields
    ore_fatturate: dettaglio.ore_fatturate,
    iva: dettaglio.iva,
    
    // Required fields for Servizio type
    tipo_cliente: 'azienda' as const,
    created_at: new Date().toISOString(),
    created_by: '',
    azienda_id: dettaglio.azienda_id || '',
    veicolo_id: dettaglio.veicolo_id || '',
    assegnato_a: dettaglio.assegnato_a || '',
    
    // Nested object: aziende
    aziende: dettaglio.azienda_nome ? {
      id: dettaglio.azienda_id || '',
      nome: dettaglio.azienda_nome,
      email: dettaglio.azienda_email || '',
      firma_digitale_attiva: false,
      partita_iva: '',
      created_at: new Date().toISOString(),
    } : undefined,
    
    // Nested object: veicoli
    veicoli: dettaglio.veicolo_modello ? {
      id: dettaglio.veicolo_id || '',
      modello: dettaglio.veicolo_modello,
      targa: dettaglio.veicolo_targa || '',
      numero_posti: dettaglio.veicolo_numero_posti,
      created_at: new Date().toISOString(),
      created_by: '',
    } : undefined,
    
    // Nested object: profiles (assegnato)
    profiles: dettaglio.assegnato_a_nome ? {
      id: dettaglio.assegnato_a || '',
      first_name: dettaglio.assegnato_a_nome,
      last_name: dettaglio.assegnato_a_cognome || '',
      email: '',
      role: 'dipendente',
    } : undefined,
  } as Servizio;

  return result;
}

/**
 * Adapter per normalizzare PasseggeroDettaglio a PasseggeroConDettagli
 */
export function adaptPasseggeroDettaglioToConDettagli(dettaglio: PasseggeroDettaglio): PasseggeroConDettagli {
  // Split nome_cognome in nome e cognome
  const [nome = '', ...cognomeParts] = (dettaglio.nome_cognome || '').split(' ');
  const cognome = cognomeParts.join(' ');

  return {
    id: dettaglio.id,
    nome_cognome: dettaglio.nome_cognome,
    nome,
    cognome,
    localita: dettaglio.localita,
    indirizzo: dettaglio.indirizzo,
    email: dettaglio.email,
    telefono: dettaglio.telefono,
    orario_presa_personalizzato: dettaglio.orario_presa_personalizzato,
    luogo_presa_personalizzato: dettaglio.luogo_presa_personalizzato,
    destinazione_personalizzato: dettaglio.destinazione_personalizzato,
    // Required fields
    azienda_id: '',
    referente_id: '',
    usa_indirizzo_personalizzato: !!(
      dettaglio.luogo_presa_personalizzato || 
      dettaglio.destinazione_personalizzato
    ),
  };
}
