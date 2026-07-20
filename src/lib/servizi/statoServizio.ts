import { StatoServizio } from '@/lib/types/servizi';

/**
 * Fonte unica per etichette e colori degli stati servizio.
 *
 * PERCHE' ESISTE: le stesse informazioni erano ridefinite in circa 55 punti su
 * 45 file, e le definizioni non concordavano. Il caso peggiore era fra la lista
 * desktop (pages/servizi/ServiziPage.tsx) e quella mobile
 * (pages/servizi/MobileServiziPage.tsx), che divergevano su quattro stati su
 * cinque, con tre collisioni di significato:
 *
 *   rosso   = annullato su desktop, da_assegnare su mobile
 *   giallo  = da_assegnare su desktop, assegnato su mobile
 *   blu     = assegnato su desktop, consuntivato su mobile
 *
 * Un operatore che passava da computer a telefono leggeva lo stesso colore con
 * un significato diverso, su un gestionale in cui "annullato" e "da assegnare"
 * richiedono azioni opposte. Non era debito estetico: era un difetto operativo.
 *
 * QUALE VERSIONE E' STATA SCELTA: quella desktop, perche' copre tutti e otto
 * gli stati, e' gia' condivisa dalla pagina di ricerca ed e' l'unica
 * semanticamente coerente (rosso per annullato, verde per completato). La mappa
 * mobile ne copriva cinque e faceva cadere bozza e non_accettato nello stesso
 * grigio di riserva, rendendoli indistinguibili.
 *
 * Le etichette vengono da formatStatoLabel di utils/servizioValidation.ts, che
 * era l'unica completa.
 *
 * NOTA PER CHI MODIFICA: le classi sono scritte per esteso e non composte
 * (niente `bg-${colore}-500`). Tailwind analizza i sorgenti come testo e
 * genera solo le classi che vede scritte intere: una stringa costruita a
 * runtime verrebbe eliminata dal purge e il badge resterebbe senza colore.
 */

/** Tutti gli stati, in ordine di ciclo di vita. Utile per costruire filtri e
 *  legende senza riscrivere l'elenco. */
export const STATI_SERVIZIO: StatoServizio[] = [
  'bozza',
  'richiesta_cliente',
  'da_assegnare',
  'assegnato',
  'completato',
  'consuntivato',
  'annullato',
  'non_accettato',
];

const ETICHETTA: Record<StatoServizio, string> = {
  bozza: 'Bozza',
  richiesta_cliente: 'Richiesta Cliente',
  da_assegnare: 'Da Assegnare',
  assegnato: 'Assegnato',
  completato: 'Completato',
  consuntivato: 'Consuntivato',
  annullato: 'Annullato',
  non_accettato: 'Non Accettato',
};

/** Badge pieno: sfondo saturo e testo bianco. Usato nelle liste servizi, dove
 *  il badge deve staccare sulla riga. */
const SOLIDO: Record<StatoServizio, string> = {
  bozza: 'bg-gray-400 text-white',
  richiesta_cliente: 'bg-pink-500 text-white',
  da_assegnare: 'bg-yellow-500 text-white',
  assegnato: 'bg-blue-500 text-white',
  completato: 'bg-green-500 text-white',
  consuntivato: 'bg-purple-500 text-white',
  annullato: 'bg-red-500 text-white',
  non_accettato: 'bg-orange-500 text-white',
};

/** Badge tenue, con variante per il tema scuro. Usato nella ricerca e nelle
 *  viste dense, dove il pieno risulterebbe pesante. */
const TENUE: Record<StatoServizio, string> = {
  bozza: 'bg-muted text-muted-foreground',
  richiesta_cliente: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  da_assegnare: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  assegnato: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  completato: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  consuntivato: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  annullato: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  non_accettato: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

/** Etichetta leggibile. Per uno stato sconosciuto restituisce il valore grezzo,
 *  cosi' un dato inatteso resta visibile invece di sparire. */
export function getStatoLabel(stato: string): string {
  return ETICHETTA[stato as StatoServizio] ?? stato;
}

export function getStatoBadgeSolid(stato: string): string {
  return SOLIDO[stato as StatoServizio] ?? 'bg-gray-500 text-white';
}

export function getStatoBadgeSoft(stato: string): string {
  return TENUE[stato as StatoServizio] ?? 'bg-muted text-muted-foreground';
}
