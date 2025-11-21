export enum TipoPagamento {
  DIRETTO_AZIENDA = 'diretto_azienda', // Bonifico - no fields needed
  CONTANTI_UBER = 'contanti_uber',      // Contanti, Uber - amount without VAT
  CARTA = 'carta'                        // Carta - amount with VAT
}

/**
 * Classifica il metodo di pagamento in 3 categorie:
 * - DIRETTO_AZIENDA: Bonifico → solo conferma, incasso in consuntivazione
 * - CONTANTI_UBER: Contanti, Uber → incasso SENZA IVA
 * - CARTA: Carta → incasso CON IVA dal servizio
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
