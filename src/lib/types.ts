
export type UserRole = 'admin' | 'socio' | 'dipendente' | 'cliente';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  azienda_id?: string | null;
  email?: string | null; // Added email field
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
  indirizzo?: string | null;
  firma_digitale_attiva?: boolean | null;
  provvigione?: boolean | null;
  created_at: string;
}
