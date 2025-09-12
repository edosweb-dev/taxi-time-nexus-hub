
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
