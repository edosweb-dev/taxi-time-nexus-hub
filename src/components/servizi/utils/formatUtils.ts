
import { Servizio } from "@/lib/types/servizi";

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
 * ordinato per data di creazione (dal più vecchio al più nuovo)
 * @param targetId L'ID del servizio di cui si vuole calcolare l'indice
 * @param allServizi Tutti i servizi nel sistema con campo created_at
 * @returns L'indice del servizio nel sistema ordinato cronologicamente
 */
export function getServizioIndex(targetId: string, allServizi: Servizio[]): number {
  // Safety check: ensure allServizi is a valid array
  if (!allServizi || !Array.isArray(allServizi) || allServizi.length === 0) {
    return 0;
  }
  
  // Ordina i servizi per data di creazione (dal più vecchio al più nuovo)
  const sortedServizi = [...allServizi].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  // Trova l'indice del servizio target nell'array ordinato
  const index = sortedServizi.findIndex(servizio => servizio.id === targetId);
  return index >= 0 ? index : 0;
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
