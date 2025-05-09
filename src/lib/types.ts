
export type UserRole = 'admin' | 'socio' | 'dipendente' | 'cliente';

export interface Profile {
  id: string;
  updated_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
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
