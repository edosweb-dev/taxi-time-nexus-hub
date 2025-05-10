
import { supabase } from './supabase';
import { Profile } from './types';

export type UserFormData = {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'socio' | 'dipendente' | 'cliente';
};

export async function getUsers(): Promise<Profile[]> {
  try {
    // Log debug completi
    console.log("[getUsers] Iniziando il recupero degli utenti dalla tabella profiles");
    
    // Log della query che verrà eseguita senza toJSON() che causa errore
    const query = supabase.from('profiles').select('*').order('last_name', { ascending: true });
    console.log("[getUsers] Query in esecuzione:", "SELECT * FROM profiles ORDER BY last_name ASC");
    
    const { data, error } = await query;

    if (error) {
      console.error('[getUsers] Errore nel recupero degli utenti:', error);
      console.error('[getUsers] Dettagli completi errore:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('[getUsers] Nessun utente trovato nel database');
    } else {
      console.log(`[getUsers] Recuperati ${data.length} utenti dal database`);
      console.log('[getUsers] Struttura dati utente:', JSON.stringify(data[0], null, 2));
      
      // Verifichiamo i valori effettivi dei campi critici
      const missingFirstNames = data.filter(user => !user.first_name).length;
      const missingLastNames = data.filter(user => !user.last_name).length;
      const roleDistribution = data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`[getUsers] Utenti senza first_name: ${missingFirstNames}`);
      console.log(`[getUsers] Utenti senza last_name: ${missingLastNames}`);
      console.log(`[getUsers] Distribuzione dei ruoli:`, roleDistribution);
    }
    
    return data as Profile[] || [];
  } catch (error) {
    console.error('[getUsers] Errore critico durante il recupero degli utenti:', error);
    // Ritorniamo un array vuoto invece di far fallire l'intera applicazione
    return [];
  }
}

export async function getUserById(id: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function createUser(userData: UserFormData): Promise<{ user: Profile | null; error: any }> {
  try {
    // Verifica completa dei dati in ingresso
    console.log("Creating user with data:", JSON.stringify(userData, null, 2));
    console.log("First name:", userData.first_name);
    console.log("Last name:", userData.last_name);
    console.log("Email:", userData.email);
    console.log("Role being assigned:", userData.role);
    
    // Verifica se i campi richiesti sono presenti e validi
    if (!userData.first_name || !userData.last_name || !userData.role || !userData.email) {
      console.error("Missing required fields:", { 
        first_name: userData.first_name, 
        last_name: userData.last_name,
        email: userData.email, 
        role: userData.role 
      });
      return { user: null, error: { message: "Campi obbligatori mancanti" } };
    }
    
    // Verifico che il ruolo sia valido
    const validRoles = ['admin', 'socio', 'dipendente', 'cliente'];
    if (!validRoles.includes(userData.role)) {
      console.error("Invalid role:", userData.role);
      return { user: null, error: { message: `Ruolo non valido: ${userData.role}` } };
    }
    
    // Crea l'utente con la funzione signUp, SENZA emailRedirectTo per evitare email di conferma
    console.log("Calling supabase.auth.signUp with:", {
      email: userData.email,
      password: userData.password ? "PROVIDED (not logged)" : "DEFAULT PASSWORD (not logged)",
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      }
    });
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password || 'Password123', // Default password if none is provided
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role
        }
        // Rimuoviamo emailRedirectTo per evitare l'invio di email di conferma
      }
    });

    if (authError) {
      console.error("Auth error during user creation:", authError);
      return { user: null, error: authError };
    }

    console.log("Auth data after user creation:", authData);

    // Se l'utente è stato creato con successo
    if (authData.user) {
      try {
        // Creiamo un oggetto profilo completo
        const profile: Profile = {
          id: authData.user.id,
          first_name: userData.first_name, // Valorizzato dal form
          last_name: userData.last_name,   // Valorizzato dal form
          role: userData.role              // Valorizzato dal form
        };
        
        console.log("Created profile object for immediate UI feedback:", profile);
        
        // Eseguiamo un upsert esplicito nella tabella profiles
        console.log("Attempting to upsert profile with data:", {
          id: authData.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role
        });
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: authData.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              role: userData.role
            }
          ], { onConflict: 'id' });
          
        if (profileError) {
          console.error("Profile creation error:", profileError);
          console.error("Full profile error details:", JSON.stringify(profileError, null, 2));
          // Continuiamo comunque con l'oggetto profilo sintetico per l'UI
          console.log("Continuing with synthetic profile despite upsert error");
          
          if (profileError.message?.includes('row-level security policy')) {
            console.error("RLS policy error detected. This could be caused by insufficient permissions.");
          }
        } else {
          console.log("Profile upserted successfully:", profileData);
        }
        
        return { user: profile, error: null };
      } catch (error) {
        console.error('Error in profile creation:', error);
        return { user: null, error: { message: "Errore durante la creazione del profilo" } };
      }
    }

    return { user: null, error: { message: "Creazione utente fallita" } };
  } catch (error) {
    console.error('Error in createUser:', error);
    return { user: null, error };
  }
}

export async function updateUser(id: string, userData: Partial<UserFormData>): Promise<{ success: boolean; error: any }> {
  try {
    console.log("Updating user with ID:", id, "and data:", userData);
    console.log("Role being updated to:", userData.role);
    
    // 1. Update profile data
    const profileData: Partial<Profile> = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role
    };

    console.log("Profile data being sent to Supabase:", profileData);

    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select();

    if (profileError) {
      console.error("Profile update error:", profileError);
      console.error("Full update error details:", JSON.stringify(profileError, null, 2));
      return { success: false, error: profileError };
    }

    console.log("Profile updated successfully:", updatedProfile);

    // 2. If password is provided, update it using the auth.updateUser API
    if (userData.password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: userData.password
      });

      if (passwordError) {
        console.error("Password update error:", passwordError);
        return { success: false, error: passwordError };
      }
      
      console.log("Password updated successfully");
    }

    console.log("User updated successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateUser:', error);
    return { success: false, error };
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error: any }> {
  try {
    console.log("Deleting user with ID:", id);
    
    // Delete user from profiles table
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("User deletion error:", error);
      console.error("Full deletion error details:", JSON.stringify(error, null, 2));
      return { success: false, error };
    }
    
    console.log("User deleted successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return { success: false, error };
  }
}
