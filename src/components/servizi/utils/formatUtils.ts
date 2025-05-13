
/**
 * Formatta un ID come numero progressivo
 * @param id L'UUID del servizio
 * @param index L'indice nell'array dei servizi
 * @returns L'ID formattato come numero progressivo (es. #001, #002, ecc.)
 */
export function formatProgressiveId(id: string, index: number): string {
  return `#${String(index + 1).padStart(3, '0')}`;
}

/**
 * Formatta un valore monetario
 * @param value Il valore da formattare
 * @returns Il valore formattato in Euro
 */
export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null) return '€ 0,00';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}
