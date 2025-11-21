export interface ReportSocioRow {
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  
  // Dati base
  riporto: number;
  stipendio: number;
  prelievi: number;
  speseEffettuate: number;
  incassiDaDipendenti: number;
  incassiPersonali: number;
  
  // Calcolati
  totaleMese: number;
  totalePercentuale: number;
  incrementaleStipendi: number;
}

export interface ReportSocioStats {
  totaleStipendi: number;
  totalePrelievi: number;
  totaleSpese: number;
  totaleIncassi: number;
  numeroSoci: number;
  mediaStipendio: number;
}

export interface ReportSocioFilters {
  mese: number;
  anno: number;
}
