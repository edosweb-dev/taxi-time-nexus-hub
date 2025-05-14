
import { MetodoPagamentoOption, AliquotaIvaOption } from "../types/impostazioni";

/**
 * Retrieves the IVA percentage for a payment method
 */
export function getIvaPercentageForPaymentMethod(
  metodoPagamento: string,
  metodiPagamento: MetodoPagamentoOption[],
  aliquoteIva: AliquotaIvaOption[]
): number {
  // Find the payment method configuration
  const metodo = metodiPagamento.find(m => m.nome === metodoPagamento);
  
  // If method not found or IVA not applicable, return 0
  if (!metodo || metodo.iva_applicabile !== true) {
    return 0;
  }
  
  // Find the associated VAT rate
  if (metodo.aliquota_iva) {
    const aliquota = aliquoteIva.find(a => a.id === metodo.aliquota_iva);
    if (aliquota) {
      return aliquota.percentuale;
    }
  }
  
  // Default to 0 if no matching VAT rate found
  return 0;
}

/**
 * Calculates the VAT amount for a given amount and payment method
 */
export function calculateIva(
  amount: number,
  metodoPagamento: string,
  metodiPagamento: MetodoPagamentoOption[],
  aliquoteIva: AliquotaIvaOption[]
): { ivaAmount: number; ivaPercentage: number } {
  const ivaPercentage = getIvaPercentageForPaymentMethod(
    metodoPagamento,
    metodiPagamento,
    aliquoteIva
  );
  
  const ivaAmount = amount * (ivaPercentage / 100);
  
  return {
    ivaAmount,
    ivaPercentage
  };
}
