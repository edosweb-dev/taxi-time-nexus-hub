const normalize = (s?: string | null) => (s || '').trim().toLowerCase();

export function hasRealCustomAddress(
  passeggero: {
    usa_indirizzo_personalizzato?: boolean;
    luogo_presa_personalizzato?: string | null;
    localita_presa_personalizzato?: string | null;
  },
  servizio: {
    indirizzo_presa?: string;
    citta_presa?: string | null;
  }
): boolean {
  // ⚠️ Non ci fidiamo solo del flag (può essere incoerente sui dati legacy):
  // se il testo del luogo di presa manca, NON è custom.
  if (!passeggero.luogo_presa_personalizzato) return false;

  const serviceSet = [
    normalize(servizio.indirizzo_presa),
    normalize(servizio.citta_presa)
  ].filter(Boolean).sort().join('|');

  const passeggeroSet = [
    normalize(passeggero.luogo_presa_personalizzato),
    normalize(passeggero.localita_presa_personalizzato)
  ].filter(Boolean).sort().join('|');

  return serviceSet !== passeggeroSet;
}

export function hasRealCustomDestination(
  passeggero: {
    usa_destinazione_personalizzata?: boolean;
    destinazione_personalizzato?: string | null;
    localita_destinazione_personalizzato?: string | null;
  },
  servizio: {
    indirizzo_destinazione?: string;
    citta_destinazione?: string | null;
  }
): boolean {
  // ⚠️ Non ci fidiamo solo del flag (può essere incoerente sui dati legacy):
  // se il testo della destinazione personalizzata manca, NON è custom.
  if (!passeggero.destinazione_personalizzato) return false;

  const serviceSet = [
    normalize(servizio.indirizzo_destinazione),
    normalize(servizio.citta_destinazione)
  ].filter(Boolean).sort().join('|');

  const passeggeroSet = [
    normalize(passeggero.destinazione_personalizzato),
    normalize(passeggero.localita_destinazione_personalizzato)
  ].filter(Boolean).sort().join('|');

  return serviceSet !== passeggeroSet;
}

export interface DestinazioneRaggruppata {
  indirizzo: string;
  citta?: string;
  passeggeri: string[];
}

export function getDestinazioniRaggruppate(
  passeggeriOrdinati: Array<{
    destinazione_personalizzato?: string | null;
    localita_destinazione_personalizzato?: string | null;
    localita?: string | null;
    localita_inline?: string | null;
    nome_cognome?: string | null;
  }>,
  servizio: {
    indirizzo_destinazione?: string;
    citta_destinazione?: string | null;
  }
): DestinazioneRaggruppata[] {
  const destinazioniMap = new Map<string, DestinazioneRaggruppata>();

  passeggeriOrdinati.forEach((p) => {
    const haDestPersonalizzata = !!p.destinazione_personalizzato;
    const indirizzo = haDestPersonalizzata
      ? p.destinazione_personalizzato!
      : servizio.indirizzo_destinazione;
    const citta = haDestPersonalizzata
      ? (p.localita_destinazione_personalizzato || p.localita_inline || p.localita || servizio.citta_destinazione)
      : servizio.citta_destinazione;
    const key = `${indirizzo}|${citta || ''}`.toLowerCase().trim();

    if (!destinazioniMap.has(key)) {
      destinazioniMap.set(key, { indirizzo: indirizzo || '', citta: citta || undefined, passeggeri: [] });
    }
    destinazioniMap.get(key)!.passeggeri.push(p.nome_cognome || 'Passeggero');
  });

  return Array.from(destinazioniMap.values());
}
