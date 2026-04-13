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
  if (!passeggero.usa_indirizzo_personalizzato || !passeggero.luogo_presa_personalizzato) return false;

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
  if (!passeggero.usa_destinazione_personalizzata || !passeggero.destinazione_personalizzato) return false;

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
