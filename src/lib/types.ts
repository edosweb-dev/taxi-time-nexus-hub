
export type UserRole = 'admin' | 'socio' | 'dipendente' | 'cliente';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
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
