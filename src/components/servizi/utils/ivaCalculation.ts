/**
 * @deprecated OPZIONE C (IVA IBRIDA) - Questo file è DEPRECATO.
 * 
 * L'IVA viene ora gestita così:
 * - CREAZIONE: IVA viene presa dalla configurazione del metodo pagamento e salvata in servizio.iva
 * - VISUALIZZAZIONE/MODIFICA: Usare sempre servizio.iva (valore storico dal DB)
 * 
 * NON usare più queste funzioni. Usare direttamente servizio.iva ?? 10 per fallback.
 */

import { MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { Servizio } from "@/lib/types/servizi";
import { getImpostazioni } from "@/lib/api/impostazioni/getImpostazioni";

/**
 * @deprecated Usare servizio.iva invece
 */
export async function getIvaPercentageForServizio(servizio: Servizio): Promise<number> {
  try {
    const impostazioni = await getImpostazioni();
    if (!impostazioni) return 0; // ✅ Default a 0 se impostazioni non trovate
    
    const { metodi_pagamento, aliquote_iva } = impostazioni;
    
    // Find the payment method configuration
    const metodo = metodi_pagamento.find(m => m.nome === servizio.metodo_pagamento);
    
    // If method not found or IVA not applicable, return 0
    if (!metodo || metodo.iva_applicabile !== true) {
      return 0;
    }
    
    // Find the associated VAT rate
    if (metodo.aliquota_iva) {
      const aliquota = aliquote_iva.find(a => a.id === metodo.aliquota_iva);
      if (aliquota) {
        return aliquota.percentuale;
      }
    }
    
    return 0; // ✅ Default a 0 se aliquota non trovata
  } catch (error) {
    console.error("Error getting IVA percentage:", error);
    return 0; // ✅ Default a 0 in caso di errore
  }
}

/**
 * Calculates the amount of IVA for a servizio
 */
export async function calculateIvaForServizio(
  servizio: Servizio, 
  importo: number
): Promise<number> {
  const ivaPercentage = await getIvaPercentageForServizio(servizio);
  return importo * (ivaPercentage / 100);
}
