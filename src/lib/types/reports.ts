
export interface Report {
  id: string;
  created_at: string;
  updated_at: string;
  azienda_id: string;
  created_by: string;
  tipo_report: 'servizi' | 'finanziario' | 'veicoli';
  nome_file: string;
  url_file?: string;
  data_inizio: string;
  data_fine: string;
  numero_servizi: number;
  totale_imponibile: number;
  totale_iva: number;
  totale_documento: number;
  stato: 'in_generazione' | 'completato' | 'errore';
  errore_messaggio?: string;
  // Joined data
  azienda?: {
    id: string;
    nome: string;
  };
}

export interface CreateReportData {
  azienda_id: string;
  tipo_report: 'servizi' | 'finanziario' | 'veicoli';
  data_inizio: string;
  data_fine: string;
  is_preview?: boolean; // Nuovo campo per identificare anteprime
}

export interface ReportFilters {
  azienda_id?: string;
  tipo_report?: string;
  data_inizio?: string;
  data_fine?: string;
}
