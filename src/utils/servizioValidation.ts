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
  console.log('[DEBUG servizioValidation] hasAllRequiredFields - INPUT servizio:', servizio);
  
  const tipoCliente = servizio.tipo_cliente || 'azienda';
  console.log('[DEBUG servizioValidation] hasAllRequiredFields - tipo_cliente:', tipoCliente);
  
  // Campi comuni sempre obbligatori
  const hasCommonFields = !!(
    servizio.data_servizio &&
    servizio.orario_servizio &&
    servizio.indirizzo_presa &&
    servizio.indirizzo_destinazione
    // metodo_pagamento è opzionale - può essere compilato dopo
  );

  console.log('[DEBUG servizioValidation] hasAllRequiredFields - Campi comuni:', {
    data_servizio: servizio.data_servizio,
    orario_servizio: servizio.orario_servizio,
    indirizzo_presa: servizio.indirizzo_presa,
    indirizzo_destinazione: servizio.indirizzo_destinazione,
    metodo_pagamento: servizio.metodo_pagamento + ' (opzionale)',
    referente_id: servizio.referente_id + ' (opzionale)'
  });
  console.log('[DEBUG servizioValidation] hasAllRequiredFields - hasCommonFields:', hasCommonFields);

  if (!hasCommonFields) {
    console.log('[DEBUG servizioValidation] hasAllRequiredFields - RESULT: false (campi comuni mancanti)');
    return false;
  }

  // Campi specifici per tipo cliente
  if (tipoCliente === 'azienda') {
    const hasAzienda = !!(servizio.azienda_id);
    console.log('[DEBUG servizioValidation] hasAllRequiredFields - Cliente AZIENDA:', {
      azienda_id: servizio.azienda_id,
      hasAzienda
    });
    console.log('[DEBUG servizioValidation] hasAllRequiredFields - RESULT:', hasAzienda);
    return hasAzienda;
  } else {
    // Cliente privato: O ha cliente_privato_id O ha nome+cognome inline
    const hasPrivato = !!(
      servizio.cliente_privato_id || 
      (servizio.cliente_privato_nome && servizio.cliente_privato_cognome)
    );
    console.log('[DEBUG servizioValidation] hasAllRequiredFields - Cliente PRIVATO:', {
      cliente_privato_id: servizio.cliente_privato_id,
      cliente_privato_nome: servizio.cliente_privato_nome,
      cliente_privato_cognome: servizio.cliente_privato_cognome,
      hasPrivato
    });
    console.log('[DEBUG servizioValidation] hasAllRequiredFields - RESULT:', hasPrivato);
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
  console.log('[DEBUG servizioValidation] hasDriverAssigned - INPUT servizio:', {
    assegnato_a: servizio.assegnato_a,
    conducente_esterno: servizio.conducente_esterno,
    conducente_esterno_id: servizio.conducente_esterno_id
  });
  
  // Conducente dipendente
  if (servizio.assegnato_a) {
    console.log('[DEBUG servizioValidation] hasDriverAssigned - Conducente DIPENDENTE trovato');
    console.log('[DEBUG servizioValidation] hasDriverAssigned - RESULT: true');
    return true;
  }
  
  // Conducente esterno
  if (servizio.conducente_esterno === true && servizio.conducente_esterno_id) {
    console.log('[DEBUG servizioValidation] hasDriverAssigned - Conducente ESTERNO trovato');
    console.log('[DEBUG servizioValidation] hasDriverAssigned - RESULT: true');
    return true;
  }
  
  console.log('[DEBUG servizioValidation] hasDriverAssigned - Nessun conducente trovato');
  console.log('[DEBUG servizioValidation] hasDriverAssigned - RESULT: false');
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
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   CALCOLO STATO SERVIZIO - DEBUG      ║');
  console.log('╚═══════════════════════════════════════╝');
  
  console.log('📥 INPUT DATA ricevuto:');
  console.log('  - data_servizio:', servizio.data_servizio, typeof servizio.data_servizio);
  console.log('  - orario_servizio:', servizio.orario_servizio, typeof servizio.orario_servizio);
  console.log('  - indirizzo_presa:', servizio.indirizzo_presa, typeof servizio.indirizzo_presa);
  console.log('  - indirizzo_destinazione:', servizio.indirizzo_destinazione, typeof servizio.indirizzo_destinazione);
  console.log('  - assegnato_a:', servizio.assegnato_a, typeof servizio.assegnato_a);
  console.log('  - tipo_cliente:', servizio.tipo_cliente);
  console.log('  - azienda_id:', servizio.azienda_id);
  console.log('  - referente_id:', servizio.referente_id);
  console.log('  - stato_corrente:', servizio.stato);
  
  // REGOLA 1: Non modificare stati avanzati (post-assegnazione)
  const statiBloccati: StatoServizio[] = ['completato', 'consuntivato', 'annullato', 'non_accettato'];
  
  if (servizio.stato && statiBloccati.includes(servizio.stato)) {
    console.log('🔒 STATO BLOCCATO - Mantengo stato corrente:', servizio.stato);
    console.log('═══════════════════════════════════════');
    return servizio.stato;
  }
  
  console.log('✅ Stato può transitare, procedo con calcolo');
  
  // Validazione campi
  const hasRequired = hasAllRequiredFields(servizio);
  const hasDriver = hasDriverAssigned(servizio);
  
  console.log('🔍 VALIDAZIONE:');
  console.log('  - hasAllRequiredFields:', hasRequired);
  console.log('  - hasDriverAssigned:', hasDriver);

  // REGOLA 3: Campi incompleti → rimane bozza
  if (!hasRequired) {
    console.log('❌ MANCANO CAMPI ESSENZIALI');
    console.log('🎯 STATO CALCOLATO: "bozza"');
    console.log('═══════════════════════════════════════');
    return 'bozza';
  }
  
  console.log('✅ SERVIZIO COMPLETO (ha tutti i campi base)');
  
  // REGOLA 4: Campi completi + conducente → assegnato
  if (hasDriver) {
    console.log('🚗 Ha autista assegnato: SÌ');
    console.log('🎯 STATO CALCOLATO: "assegnato"');
    console.log('═══════════════════════════════════════');
    return 'assegnato';
  }
  
  // REGOLA 5: Campi completi senza conducente → da assegnare
  console.log('🚗 Ha autista assegnato: NO');
  console.log('🎯 STATO CALCOLATO: "da_assegnare"');
  console.log('═══════════════════════════════════════');
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
