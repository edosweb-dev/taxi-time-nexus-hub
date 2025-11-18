import type { Servizio, StatoServizio, TipoCliente } from '@/lib/types/servizi';

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'destructive' | 'outline';

/**
 * Verifica se il servizio ha tutti i campi obbligatori compilati.
 * 
 * Campi obbligatori:
 * - tipo_cliente (sempre presente, default 'azienda')
 * - azienda_id (se tipo_cliente = 'azienda')
 * - cliente_privato_id OR (cliente_privato_nome + cliente_privato_cognome) (se tipo_cliente = 'privato')
 * - data_servizio
 * - orario_servizio
 * - indirizzo_presa
 * - indirizzo_destinazione
 * 
 * Campi opzionali (possono essere compilati dopo):
 * - metodo_pagamento
 * - referente_id
 * 
 * @param servizio - Servizio parziale da validare
 * @returns true se tutti i campi obbligatori sono compilati
 */
export function hasAllRequiredFields(servizio: Partial<Servizio>): boolean {
  console.log('🔍 [hasAllRequiredFields] INPUT:', {
    data_servizio: servizio.data_servizio,
    orario_servizio: servizio.orario_servizio,
    indirizzo_presa: servizio.indirizzo_presa,
    indirizzo_destinazione: servizio.indirizzo_destinazione,
    data_servizio_type: typeof servizio.data_servizio,
    orario_servizio_type: typeof servizio.orario_servizio,
    indirizzo_presa_type: typeof servizio.indirizzo_presa,
    indirizzo_destinazione_type: typeof servizio.indirizzo_destinazione,
    data_servizio_length: servizio.data_servizio?.length,
    orario_servizio_length: servizio.orario_servizio?.length,
    indirizzo_presa_length: servizio.indirizzo_presa?.length,
    indirizzo_destinazione_length: servizio.indirizzo_destinazione?.length
  });

  const tipoCliente = servizio.tipo_cliente || 'azienda';
  
  // Campi comuni - IMPORTANTE: controllo anche stringhe vuote!
  const campiComuni = {
    data_servizio: Boolean(servizio.data_servizio && servizio.data_servizio.trim()),
    orario_servizio: Boolean(servizio.orario_servizio && servizio.orario_servizio.trim()),
    indirizzo_presa: Boolean(servizio.indirizzo_presa && servizio.indirizzo_presa.trim()),
    indirizzo_destinazione: Boolean(servizio.indirizzo_destinazione && servizio.indirizzo_destinazione.trim())
  };
  
  console.log('🔍 [hasAllRequiredFields] Campi validati:', campiComuni);
  
  // TUTTI i campi comuni devono essere presenti e non vuoti
  const hasComuni = campiComuni.data_servizio && 
                    campiComuni.orario_servizio &&
                    campiComuni.indirizzo_presa && 
                    campiComuni.indirizzo_destinazione;
  
  console.log('🔍 [hasAllRequiredFields] hasComuni:', hasComuni);
  
  if (!hasComuni) {
    console.log('❌ [hasAllRequiredFields] Mancano campi comuni → INCOMPLETO');
    return false;
  }
  
  // Campi specifici per tipo cliente
  if (tipoCliente === 'azienda') {
    const hasAzienda = Boolean(servizio.azienda_id);
    console.log('🔍 [hasAllRequiredFields] Azienda check:', hasAzienda);
    return hasAzienda;
  } else {
    // Cliente privato: O ha cliente_privato_id O ha nome+cognome inline
    const hasPrivato = Boolean(
      servizio.cliente_privato_id || 
      (servizio.cliente_privato_nome && servizio.cliente_privato_cognome)
    );
    console.log('🔍 [hasAllRequiredFields] Cliente privato check:', hasPrivato);
    return hasPrivato;
  }
}

/**
 * Verifica se il servizio ha un conducente assegnato.
 * 
 * @param servizio - Servizio da controllare
 * @returns true se:
 *   - assegnato_a è compilato (conducente dipendente)
 *   - OPPURE conducente_esterno === true AND conducente_esterno_id è compilato
 */
export function hasDriverAssigned(servizio: Partial<Servizio>): boolean {
  // Conducente dipendente
  if (servizio.assegnato_a) {
    return true;
  }
  
  // Conducente esterno
  if (servizio.conducente_esterno === true && servizio.conducente_esterno_id) {
    return true;
  }
  
  return false;
}

/**
 * Calcola lo stato automatico del servizio in base alla completezza dei campi.
 * 
 * REGOLE:
 * 1. Se stato corrente NON è 'bozza' → mantieni stato attuale (non retrocedere)
 * 2. Se manca almeno un campo obbligatorio → 'bozza'
 * 3. Se ha tutti i campi + conducente assegnato → 'assegnato'
 * 4. Se ha tutti i campi senza conducente → 'da_assegnare'
 * 
 * @param servizio - Servizio da analizzare
 * @returns Stato calcolato
 */
export function calculateServizioStato(servizio: Partial<Servizio>): StatoServizio {
  // REGOLA 1: Non modificare stati avanzati (post-assegnazione)
  const statiBloccati: StatoServizio[] = ['completato', 'consuntivato', 'annullato', 'non_accettato'];
  
  if (servizio.stato && statiBloccati.includes(servizio.stato)) {
    return servizio.stato;
  }
  
  // Validazione campi
  const hasRequired = hasAllRequiredFields(servizio);
  const hasDriver = hasDriverAssigned(servizio);

  // REGOLA 3: Campi incompleti → rimane bozza
  if (!hasRequired) {
    return 'bozza';
  }
  
  
  
  // REGOLA 4: Campi completi + conducente → assegnato
  if (hasDriver) {
    return 'assegnato';
  }

  // REGOLA 5: Campi completi senza conducente → da assegnare
  return 'da_assegnare';
}

/**
 * Restituisce un array di label user-friendly dei campi obbligatori mancanti.
 * 
 * @param servizio - Servizio da analizzare
 * @returns Array di stringhe tipo: ['Azienda', 'Data servizio', 'Metodo di pagamento']
 */
export function getMissingFields(servizio: Partial<Servizio>): string[] {
  const missing: string[] = [];
  const tipoCliente = servizio.tipo_cliente || 'azienda';

  // Campi comuni obbligatori
  if (!servizio.data_servizio) missing.push('Data servizio');
  if (!servizio.orario_servizio) missing.push('Orario servizio');
  if (!servizio.indirizzo_presa) missing.push('Indirizzo di presa');
  if (!servizio.indirizzo_destinazione) missing.push('Indirizzo di destinazione');
  // metodo_pagamento è opzionale - rimosso dai campi obbligatori

  // Campi specifici per tipo
  if (tipoCliente === 'azienda') {
    if (!servizio.azienda_id) missing.push('Azienda');
  } else {
    if (!servizio.cliente_privato_id && 
        !(servizio.cliente_privato_nome && servizio.cliente_privato_cognome)) {
      missing.push('Cliente privato');
    }
  }

  return missing;
}

/**
 * Converte lo stato DB in label italiana user-friendly.
 * 
 * @param stato - Stato del servizio
 * @returns Label formattata in italiano
 */
export function formatStatoLabel(stato: StatoServizio): string {
  const statoLabels: Record<StatoServizio, string> = {
    'bozza': 'Bozza',
    'richiesta_cliente': 'Richiesta Cliente',
    'da_assegnare': 'Da Assegnare',
    'assegnato': 'Assegnato',
    'completato': 'Completato',
    'consuntivato': 'Consuntivato',
    'annullato': 'Annullato',
    'non_accettato': 'Non Accettato'
  };

  return statoLabels[stato] || stato;
}

/**
 * Restituisce la variante del Badge in base allo stato del servizio.
 * 
 * @param stato - Stato del servizio
 * @returns Variante del badge per UI
 */
export function getStatoBadgeVariant(stato: StatoServizio): BadgeVariant {
  const statoVariants: Record<StatoServizio, BadgeVariant> = {
    'bozza': 'secondary',
    'richiesta_cliente': 'default',
    'da_assegnare': 'default',
    'assegnato': 'success',
    'completato': 'success',
    'consuntivato': 'outline',
    'annullato': 'destructive',
    'non_accettato': 'destructive'
  };

  return statoVariants[stato] || 'default';
}
