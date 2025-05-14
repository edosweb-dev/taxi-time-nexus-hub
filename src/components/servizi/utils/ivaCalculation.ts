
import { MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { Servizio } from "@/lib/types/servizi";
import { getImpostazioni } from "@/lib/api/impostazioni/getImpostazioni";

/**
 * Retrieves the IVA percentage for a servizio based on its payment method
 */
export async function getIvaPercentageForServizio(servizio: Servizio): Promise<number> {
  try {
    const impostazioni = await getImpostazioni();
    if (!impostazioni) return 22; // default VAT if no settings found
    
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
    
    return 22; // default VAT if no matching rate found
  } catch (error) {
    console.error("Error getting IVA percentage:", error);
    return 22; // default VAT in case of error
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
