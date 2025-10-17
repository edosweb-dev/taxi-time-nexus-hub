export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  email?: string;
  azienda_id?: string;
  stipendio_fisso?: number;
}

export type UserRole = 'admin' | 'socio' | 'dipendente' | 'cliente';