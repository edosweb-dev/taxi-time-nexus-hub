
export interface Report {
  id: string;
  created_at: string;
  updated_at: string;
  azienda_id: string;
  created_by: string;
  tipo_report: string;
  nome_file: string;
  url_file?: string;
  data_inizio: string;
  data_fine: string;
  numero_servizi: number;
  totale_imponibile: number;
  totale_iva: number;
  totale_documento: number;
  stato: string;
  errore_messaggio?: string;
  referente_id?: string;
  // Joined data
  azienda?: {
    id: string;
    nome: string;
  };
  referente?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateReportData {
  azienda_id: string;
  tipo_report: 'servizi' | 'finanziario' | 'veicoli';
  data_inizio: string;
  data_fine: string;
  referente_id?: string;
  is_preview?: boolean;
}

export interface ReportFilters {
  azienda_id?: string;
  tipo_report?: string;
  data_inizio?: string;
  data_fine?: string;
  referente_id?: string;
}

export interface AvailableMonth {
  year: number;
  month: number;
  monthName: string;
  servicesCount: number;
}
