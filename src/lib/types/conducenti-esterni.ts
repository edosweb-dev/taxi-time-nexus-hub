export interface ConducenteEsterno {
  id: string;
  nome_cognome: string;
  email?: string | null;
  telefono?: string | null;
  note?: string | null;
  attivo: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ConducenteEsternoFormData {
  nome_cognome: string;
  email?: string;
  telefono?: string;
  note?: string;
  attivo?: boolean;
}

export interface CreateConducenteEsternoRequest {
  nome_cognome: string;
  email?: string;
  telefono?: string;
  note?: string;
}

export interface UpdateConducenteEsternoRequest {
  id: string;
  nome_cognome?: string;
  email?: string;
  telefono?: string;
  note?: string;
  attivo?: boolean;
}