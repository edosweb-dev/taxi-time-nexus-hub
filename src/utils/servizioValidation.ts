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
  const tipoCliente = servizio.tipo_cliente || 'azienda';
  
  // Lista di valori considerati "vuoti" (placeholder e stringhe vuote)
  const PLACEHOLDER_VALUES = ['Da definire', 'da definire', '', ' ', 'undefined', 'null'];
  
  // Helper per verificare se un campo è effettivamente compilato
  const isFieldValid = (value: any): boolean => {
    if (!value) return false;  // null, undefined, false, 0
    const trimmed = String(value).trim();
    if (!trimmed) return false;  // stringa vuota o solo spazi
    if (PLACEHOLDER_VALUES.includes(trimmed)) return false;  // placeholder
    return true;
  };
  
  // Campi comuni obbligatori a TUTTI i servizi
  const hasDataServizio = isFieldValid(servizio.data_servizio);
  const hasOrarioServizio = isFieldValid(servizio.orario_servizio);
  const hasIndirizzoPresa = isFieldValid(servizio.indirizzo_presa);
  const hasIndirizzoDest = isFieldValid(servizio.indirizzo_destinazione);
  const hasMetodoPagamento = isFieldValid(servizio.metodo_pagamento);
  
  // Se manca QUALSIASI campo comune → servizio INCOMPLETO
  if (!hasDataServizio || !hasOrarioServizio || !hasIndirizzoPresa || !hasIndirizzoDest || !hasMetodoPagamento) {
    return false;
  }
  
  // Campi specifici per tipo cliente
  if (tipoCliente === 'azienda') {
    return Boolean(servizio.azienda_id);
  } else {
    // Cliente privato: O ha cliente_privato_id O ha nome+cognome inline
    return Boolean(
      servizio.cliente_privato_id || 
      (servizio.cliente_privato_nome && servizio.cliente_privato_cognome)
    );
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
  console.log('[🔍 calculateServizioStato] === INIZIO ===');
  console.log('[🔍 calculateServizioStato] INPUT servizio:', {
    id: (servizio as any).id,
    stato_corrente: servizio.stato,
    metodo_pagamento: servizio.metodo_pagamento,
    assegnato_a: servizio.assegnato_a,
    data_servizio: servizio.data_servizio,
    indirizzo_presa: servizio.indirizzo_presa,
    indirizzo_destinazione: servizio.indirizzo_destinazione,
    azienda_id: servizio.azienda_id,
    tipo_cliente: servizio.tipo_cliente,
  });

  // REGOLA 1: Non modificare stati avanzati (post-assegnazione)
  const statiBloccati: StatoServizio[] = ['completato', 'consuntivato', 'annullato', 'non_accettato'];
  
  if (servizio.stato && statiBloccati.includes(servizio.stato)) {
    console.log('[🔍 calculateServizioStato] RETURN: stato bloccato →', servizio.stato);
    return servizio.stato;
  }
  
  // Validazione campi
  const hasRequired = hasAllRequiredFields(servizio);
  const hasDriver = hasDriverAssigned(servizio);

  console.log('[🔍 calculateServizioStato] Validazione:', {
    hasAllRequiredFields: hasRequired,
    hasDriverAssigned: hasDriver,
    missingFields: getMissingFields(servizio),
  });

  // REGOLA 3: Campi incompleti → rimane bozza
  if (!hasRequired) {
    console.log('[🔍 calculateServizioStato] RETURN: campi incompleti → bozza');
    return 'bozza';
  }
  
  // REGOLA 4: Campi completi + conducente → assegnato
  if (hasDriver) {
    console.log('[🔍 calculateServizioStato] RETURN: completo + conducente → assegnato');
    return 'assegnato';
  }

  // REGOLA 5: Campi completi senza conducente → da assegnare
  console.log('[🔍 calculateServizioStato] RETURN: completo senza conducente → da_assegnare');
  console.log('[🔍 calculateServizioStato] === FINE ===');
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
