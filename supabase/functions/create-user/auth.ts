
import { AuthCheckResult, RoleCheckResult } from "./types.ts";

export async function verifyAuthentication(supabase: any, authHeader: string | null): Promise<AuthCheckResult> {
  if (!authHeader) {
    console.error("Edge function: Autorizzazione mancante");
    return { 
      caller: null, 
      error: 'Autorizzazione mancante' 
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !caller) {
    console.error("Edge function: Utente non autorizzato", authError);
    return { 
      caller: null, 
      error: 'Utente non autorizzato' 
    };
  }
  
  return { caller, error: null };
}

export async function verifyUserRole(supabase: any, userId: string): Promise<RoleCheckResult> {
  const { data: callerProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error("Edge function: Errore nel recupero del profilo", profileError);
    return { 
      hasPermission: false, 
      callerProfile: null, 
      error: 'Errore nel recupero del profilo' 
    };
  }
  
  console.log("Edge function: Profilo del chiamante:", callerProfile);
  
  if (!callerProfile || !['admin', 'socio'].includes(callerProfile?.role)) {
    console.error("Edge function: Permessi insufficienti, ruolo:", callerProfile?.role);
    return { 
      hasPermission: false, 
      callerProfile: null, 
      error: 'Permessi insufficienti' 
    };
  }
  
  return { hasPermission: true, callerProfile, error: null };
}
