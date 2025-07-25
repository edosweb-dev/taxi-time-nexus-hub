export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  email?: string;
  azienda_id?: string;
}

export type UserRole = 'admin' | 'socio' | 'dipendente' | 'cliente';