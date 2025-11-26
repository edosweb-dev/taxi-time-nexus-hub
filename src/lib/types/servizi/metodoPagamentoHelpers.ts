export enum TipoPagamento {
  DIRETTO_AZIENDA = 'diretto_azienda', // Bonifico - no fields needed during completion
  CONTANTI_UBER = 'contanti_uber',      // Contanti, Uber - requires amount confirmation
  CARTA = 'carta'                        // Carta - requires amount confirmation
}

/**
 * Classifica il metodo di pagamento in 3 categorie per il completamento servizio:
 * - DIRETTO_AZIENDA: Bonifico → solo conferma, incasso popolato in consuntivazione
 * - CONTANTI_UBER: Contanti, Uber → richiede conferma importo (TOTALE LORDO con IVA inclusa)
 * - CARTA: Carta → richiede conferma importo (TOTALE LORDO con IVA inclusa)
 * 
 * IMPORTANTE: Tutti gli importi inseriti sono TOTALI LORDI (IVA già inclusa).
 * Il sistema fa SCORPORO IVA solo per display, mai aggiunta.
 */
export function getTipoPagamento(metodo?: string | null): TipoPagamento {
  if (!metodo) return TipoPagamento.DIRETTO_AZIENDA;
  
  const m = metodo.trim().toLowerCase();
  
  // Bonifico e metodi pagati direttamente all'azienda
  if (m.includes('bonifico') || m.includes('assegno') || m.includes('bancario')) {
    return TipoPagamento.DIRETTO_AZIENDA;
  }
  
  // Carta (con IVA)
  if (m.includes('carta') || m.includes('card') || m.includes('pos')) {
    return TipoPagamento.CARTA;
  }
  
  // Contanti, Uber, altri (senza IVA)
  return TipoPagamento.CONTANTI_UBER;
}
