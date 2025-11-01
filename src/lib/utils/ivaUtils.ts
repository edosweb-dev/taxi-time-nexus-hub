
import { MetodoPagamentoOption, AliquotaIvaOption } from "../types/impostazioni";

/**
 * Retrieves the IVA percentage for a payment method
 */
export function getIvaPercentageForPaymentMethod(
  metodoPagamento: string,
  metodiPagamento: MetodoPagamentoOption[],
  aliquoteIva: AliquotaIvaOption[]
): number {
  console.log('🔍 [ivaUtils] Input parameters:', {
    metodoPagamento,
    metodiPagamentoCount: metodiPagamento?.length || 0,
    aliquoteIvaCount: aliquoteIva?.length || 0,
    metodiPagamentoData: metodiPagamento,
    aliquoteIvaData: aliquoteIva
  });

  // Find the payment method configuration
  const metodo = metodiPagamento.find(m => m.nome === metodoPagamento);
  
  console.log('🔍 [ivaUtils] Found payment method:', {
    metodo,
    iva_applicabile: metodo?.iva_applicabile,
    aliquota_iva_id: metodo?.aliquota_iva
  });
  
  // If method not found or IVA not applicable, return 0
  if (!metodo || metodo.iva_applicabile !== true) {
    console.log('🔍 [ivaUtils] Method not found or IVA not applicable, returning 0');
    return 0;
  }
  
  // Find the associated VAT rate
  if (metodo.aliquota_iva) {
    const aliquota = aliquoteIva.find(a => {
      const match = a.id === metodo.aliquota_iva;
      console.log('🔍 [ivaUtils] Checking aliquota:', {
        aliquota_id: a.id,
        aliquota_id_type: typeof a.id,
        metodo_aliquota_id: metodo.aliquota_iva,
        metodo_aliquota_id_type: typeof metodo.aliquota_iva,
        match,
        percentuale: a.percentuale
      });
      return match;
    });
    
    console.log('🔍 [ivaUtils] Found IVA rate:', aliquota);
    
    if (aliquota) {
      console.log('✅ [ivaUtils] Returning percentage:', aliquota.percentuale);
      return aliquota.percentuale;
    }
  }
  
  // Default to 0 if no matching VAT rate found
  console.log('⚠️ [ivaUtils] No matching VAT rate found, returning 0');
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
  console.log('💰 [ivaUtils] calculateIva called with:', {
    amount,
    metodoPagamento
  });
  
  const ivaPercentage = getIvaPercentageForPaymentMethod(
    metodoPagamento,
    metodiPagamento,
    aliquoteIva
  );
  
  const ivaAmount = amount * (ivaPercentage / 100);
  
  console.log('💰 [ivaUtils] calculateIva result:', {
    ivaPercentage,
    ivaAmount
  });
  
  return {
    ivaAmount,
    ivaPercentage
  };
}
