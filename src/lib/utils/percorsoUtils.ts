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

  return normalize(passeggero.luogo_presa_personalizzato) !== normalize(servizio.indirizzo_presa)
    || normalize(passeggero.localita_presa_personalizzato) !== normalize(servizio.citta_presa);
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

  return normalize(passeggero.destinazione_personalizzato) !== normalize(servizio.indirizzo_destinazione)
    || normalize(passeggero.localita_destinazione_personalizzato) !== normalize(servizio.citta_destinazione);
}
