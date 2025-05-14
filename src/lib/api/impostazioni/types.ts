
export interface Impostazioni {
  id: string;
  nome_azienda: string;
  partita_iva: string | null;
  indirizzo_sede: string | null;
  telefono: string | null;
  email: string | null;
  metodi_pagamento: MetodoPagamentoOption[];
  aliquote_iva: AliquotaIvaOption[];
  created_at: string | null;
  updated_at: string | null;
}

export interface MetodoPagamentoOption {
  id: string;
  nome: string;
  iva_predefinita: string | null; // riferimento all'id dell'aliquota IVA
}

export interface AliquotaIvaOption {
  id: string;
  nome: string;
  percentuale: number;
  descrizione: string | null;
}

export interface ImpostazioniFormData {
  nome_azienda: string;
  partita_iva: string | null;
  indirizzo_sede: string | null;
  telefono: string | null;
  email: string | null;
  metodi_pagamento: MetodoPagamentoOption[];
  aliquote_iva: AliquotaIvaOption[];
}

export interface UpdateImpostazioniRequest {
  impostazioni: Partial<ImpostazioniFormData>;
}
