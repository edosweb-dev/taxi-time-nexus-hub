
export interface AziendaFormData {
  nome: string;
  partita_iva: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  firma_digitale_attiva?: boolean;
  provvigione?: boolean;
  provvigione_tipo?: 'fisso' | 'percentuale';
  provvigione_valore?: number;
}
