
export interface UserData {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: string;
  azienda_id?: string | null;
}

export interface UserProfileResult {
  profile: any;
  error: string | null;
}

export interface UserCreationResult {
  user: any;
  error: string | null;
}

export interface RequestParseResult {
  userData: UserData | null;
  error: string | null;
  details?: any;
}

export interface AuthCheckResult {
  caller: any;
  error: string | null;
}

export interface RoleCheckResult {
  hasPermission: boolean;
  callerProfile: any;
  error: string | null;
}

export interface SupabaseClientResult {
  supabase: any;
  error: string | null;
}
