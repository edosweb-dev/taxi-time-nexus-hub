
export interface ModalitaPagamento {
  id: string;
  nome: string;
  attivo: boolean;
  created_at: string;
}

export interface SpesaAziendale {
  id: string;
  data_movimento: string;
  importo: number;
  causale: string;
  tipologia: 'spesa' | 'incasso' | 'prelievo';
  tipo_causale?: 'generica' | 'f24' | 'pagamento_fornitori' | 'spese_gestione' | 'multe' | 'fattura_conducenti_esterni';
  modalita_pagamento_id: string;
  socio_id?: string;
  dipendente_id?: string;
  stato_pagamento: 'completato' | 'pending';
  created_at: string;
  created_by: string;
  note?: string;
  modalita_pagamento?: ModalitaPagamento;
  socio?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
  dipendente?: {
    id: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface MovimentoFormData {
  data_movimento: string;
  importo: number;
  causale: string;
  tipologia: 'spesa' | 'incasso' | 'prelievo';
  tipo_causale?: 'generica' | 'f24' | 'pagamento_fornitori' | 'spese_gestione' | 'multe' | 'fattura_conducenti_esterni';
  modalita_pagamento_id: string;
  socio_id?: string;
  dipendente_id?: string;
  note?: string;
  stato_pagamento: 'completato' | 'pending';
}

export interface TotaliMese {
  spese: number;
  incassi: number;
  prelievi: number;
  saldo: number;
}
