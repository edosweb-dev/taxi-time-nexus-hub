
export interface Veicolo {
  id: string;
  modello: string;
  targa: string;
  anno?: number;
  colore?: string;
  numero_posti?: number;
  note?: string;
  attivo: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface VeicoloFormData {
  modello: string;
  targa: string;
  anno?: number;
  colore?: string;
  numero_posti?: number;
  note?: string;
  attivo: boolean;
}

export interface CreateVeicoloRequest {
  modello: string;
  targa: string;
  anno?: number;
  colore?: string;
  numero_posti?: number;
  note?: string;
}

export interface UpdateVeicoloRequest extends CreateVeicoloRequest {
  attivo?: boolean;
}
