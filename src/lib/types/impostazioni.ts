
export interface AliquotaIvaOption {
  id: string;
  nome: string;
  percentuale: number;
  descrizione?: string;
}

export interface MetodoPagamentoOption {
  id: string;
  nome: string;
  iva_applicabile?: boolean;
  aliquota_iva?: string; // ID dell'aliquota IVA associata
}

export interface Impostazioni {
  id: string;
  nome_azienda: string;
  partita_iva?: string;
  indirizzo_sede?: string;
  telefono?: string;
  email?: string;
  metodi_pagamento: MetodoPagamentoOption[];
  aliquote_iva: AliquotaIvaOption[];
  created_at: string;
  updated_at: string;
}

export interface ImpostazioniFormData {
  id?: string;
  nome_azienda: string;
  partita_iva?: string;
  indirizzo_sede?: string;
  telefono?: string;
  email?: string;
  metodi_pagamento: MetodoPagamentoOption[];
  aliquote_iva: AliquotaIvaOption[];
}
