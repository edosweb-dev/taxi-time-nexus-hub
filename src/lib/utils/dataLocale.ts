import { format } from 'date-fns';

/**
 * Data in formato `YYYY-MM-DD` secondo l'ora italiana del browser.
 *
 * Da usare al posto di `toISOString()` seguito da split sulla "T", che
 * converte in UTC: in Italia una data a mezzanotte locale diventa il giorno
 * prima (es. 1 novembre 00:00 → "2026-10-31"), quindi i filtri di un mese
 * prendevano l'ultimo giorno del mese prima e perdevano l'ultimo del mese,
 * e le date scelte dal calendario venivano salvate un giorno indietro.
 */
export function toDataLocale(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}
