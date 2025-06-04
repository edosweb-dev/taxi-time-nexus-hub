
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export async function verifyAuthentication(
  supabase: SupabaseClient, 
  authHeader: string | null
): Promise<{ caller: any; error: string | null }> {
  if (!authHeader) {
    console.error("Edge function: Header Authorization mancante");
    return { caller: null, error: "Header Authorization mancante" };
  }
  
  const token = authHeader.replace('Bearer ', '');
  console.log("Edge function: Verifico token utente con service role");
  
  try {
    // Usa il service role client per verificare il token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error("Edge function: Errore verifica token:", error);
      return { caller: null, error: `Errore verifica token: ${error.message}` };
    }
    
    if (!user) {
      console.error("Edge function: Utente non trovato dal token");
      return { caller: null, error: "Utente non autorizzato" };
    }
    
    console.log("Edge function: Utente verificato:", user.id);
    return { caller: user, error: null };
  } catch (err) {
    console.error("Edge function: Errore durante verifica:", err);
    return { caller: null, error: "Errore durante la verifica dell'autenticazione" };
  }
}

export async function verifyUserRole(
  supabase: SupabaseClient, 
  userId: string
): Promise<{ hasPermission: boolean; error: string | null }> {
  try {
    console.log("Edge function: Verifico ruolo per utente:", userId);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Edge function: Errore recupero profilo:", error);
      return { hasPermission: false, error: `Errore recupero profilo: ${error.message}` };
    }
    
    if (!profile) {
      console.error("Edge function: Profilo non trovato per utente:", userId);
      return { hasPermission: false, error: "Profilo utente non trovato" };
    }
    
    const hasPermission = ['admin', 'socio'].includes(profile.role);
    console.log("Edge function: Ruolo utente:", profile.role, "Permesso:", hasPermission);
    
    if (!hasPermission) {
      return { hasPermission: false, error: "Permessi insufficienti per creare utenti" };
    }
    
    return { hasPermission: true, error: null };
  } catch (err) {
    console.error("Edge function: Errore verifica ruolo:", err);
    return { hasPermission: false, error: "Errore durante la verifica dei permessi" };
  }
}
