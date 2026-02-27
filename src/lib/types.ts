
export type UserRole = 'admin' | 'socio' | 'dipendente' | 'cliente';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  azienda_id?: string | null;
  email?: string | null;
  telefono?: string | null;
  color?: string | null;
  aziende?: { nome: string } | null;
}

export interface Session {
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
  };
  expires_at: number;
}

export interface Azienda {
  id: string;
  nome: string;
  partita_iva: string;
  email?: string | null;
  telefono?: string | null;
  emails?: string[] | null;
  telefoni?: string[] | null;
  indirizzo?: string | null;
  citta?: string | null;
  sdi?: string | null;
  pec?: string | null;
  firma_digitale_attiva?: boolean | null;
  provvigione?: boolean | null;
  provvigione_tipo?: string | null;
  provvigione_valore?: number | null;
  created_at: string;
}
