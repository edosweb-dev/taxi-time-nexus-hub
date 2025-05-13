
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

/**
 * Calcola l'indice progressivo di un servizio nell'elenco completo dei servizi
 * @param targetId L'ID del servizio di cui si vuole calcolare l'indice
 * @param allServizi Tutti i servizi nel sistema
 * @returns L'indice del servizio nel sistema
 */
export function getServizioIndex(targetId: string, allServizi: { id: string }[]): number {
  return allServizi.findIndex(servizio => servizio.id === targetId);
}

/**
 * Formatta una data nel formato italiano
 * @param dateString Una stringa di data
 * @returns La data formattata nel formato italiano (es. 01/01/2023)
 */
export function formatItalianDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
