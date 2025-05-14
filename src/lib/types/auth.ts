
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  session: {
    access_token: string;
    expires_at: number;
  } | null;
}

export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  role: string;
}
