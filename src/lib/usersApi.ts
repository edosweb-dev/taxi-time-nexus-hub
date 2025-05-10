
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
    console.log("[createUser] Creating user with data:", JSON.stringify(userData, null, 2));
    console.log("[createUser] First name:", userData.first_name);
    console.log("[createUser] Last name:", userData.last_name);
    console.log("[createUser] Email:", userData.email);
    console.log("[createUser] Role being assigned:", userData.role);
    
    // Verifica se i campi richiesti sono presenti e validi
    if (!userData.first_name || !userData.last_name || !userData.role || !userData.email) {
      const missingFields = [];
      if (!userData.first_name) missingFields.push("first_name");
      if (!userData.last_name) missingFields.push("last_name");
      if (!userData.role) missingFields.push("role");
      if (!userData.email) missingFields.push("email");
      console.error("[createUser] Campi obbligatori mancanti:", missingFields);
      return { user: null, error: { message: "Campi obbligatori mancanti: " + missingFields.join(", ") } };
    }
    
    // Verifico che il ruolo sia valido
    const validRoles = ['admin', 'socio', 'dipendente', 'cliente'];
    if (!validRoles.includes(userData.role)) {
      console.error("[createUser] Invalid role:", userData.role);
      return { user: null, error: { message: `Ruolo non valido: ${userData.role}` } };
    }

    // NUOVA IMPLEMENTAZIONE: Prima verifico se l'email è già registrata
    try {
      const { data: authUsers, error: checkError } = await supabase.auth.admin.listUsers();
      
      if (checkError) {
        console.error("[createUser] Errore nella verifica dell'email esistente:", checkError);
        return { user: null, error: checkError };
      }
      
      // Verifica se authUsers è valido e contiene la proprietà users
      if (authUsers && Array.isArray(authUsers.users)) {
        const userWithSameEmail = authUsers.users.find(u => u.email === userData.email);
        if (userWithSameEmail) {
          console.warn("[createUser] Email già registrata:", userData.email);
          return { user: null, error: { message: "Email già registrata" } };
        }
      } else {
        console.warn("[createUser] Formato dati utenti inatteso:", authUsers);
      }
    } catch (emailCheckError) {
      console.error("[createUser] Errore durante la verifica dell'email:", emailCheckError);
      // Continuiamo comunque, potrebbe essere un problema temporaneo
    }
    
    // Ora procedo con la creazione dell'utente
    console.log("[createUser] Calling supabase.auth.signUp with:", {
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
      }
    });

    if (authError) {
      console.error("[createUser] Auth error during user creation:", authError);
      return { user: null, error: authError };
    }

    console.log("[createUser] Auth data after user creation:", authData);

    // Se l'utente è stato creato con successo
    if (authData.user) {
      try {
        // Creiamo un oggetto profilo completo
        const profile: Profile = {
          id: authData.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role
        };
        
        console.log("[createUser] Created profile object for immediate UI feedback:", profile);
        
        // NUOVA IMPLEMENTAZIONE: Prima verifichiamo se l'handle_new_user ha creato automaticamente il profilo
        console.log("[createUser] Verifying if profile was automatically created by trigger...");
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (profileCheckError) {
          console.log("[createUser] Profile not found or error checking:", profileCheckError);
        } else if (existingProfile) {
          console.log("[createUser] Profile was automatically created, updating it:", existingProfile);
          
          // Il profilo esiste già, aggiorniamo solo i campi mancanti
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              first_name: userData.first_name,
              last_name: userData.last_name,
              role: userData.role
            })
            .eq('id', authData.user.id)
            .select();
            
          if (updateError) {
            console.error("[createUser] Error updating existing profile:", updateError);
            console.error("[createUser] Full profile update error details:", JSON.stringify(updateError, null, 2));
          } else {
            console.log("[createUser] Profile updated successfully:", updatedProfile);
            return { user: profile, error: null };
          }
        }
        
        // Se non è stato trovato un profilo o l'aggiornamento è fallito, tentiamo un insert diretto
        console.log("[createUser] Attempting direct profile insert with data:", profile);
        
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role
          }])
          .select();
          
        if (insertError) {
          console.error("[createUser] Error during direct profile insert:", insertError);
          console.error("[createUser] Full insert error details:", JSON.stringify(insertError, null, 2));
          
          // Ultimo tentativo: proviamo con upsert
          console.log("[createUser] Last attempt with upsert...");
          const { data: upsertProfile, error: upsertError } = await supabase
            .from('profiles')
            .upsert([{
              id: authData.user.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              role: userData.role
            }], { onConflict: 'id' })
            .select();
            
          if (upsertError) {
            console.error("[createUser] Upsert attempt also failed:", upsertError);
            
            // Proviamo a capire se è un problema di RLS
            if (upsertError.message?.includes('row-level security policy')) {
              console.error("[createUser] RLS policy error detected. This could be caused by insufficient permissions.");
              return { user: null, error: { message: "Errore di permessi RLS: controlla le policy in Supabase" } };
            }
            
            return { user: null, error: { message: "Impossibile creare il profilo utente" } };
          }
          
          if (!upsertProfile || upsertProfile.length === 0) {
            console.error("[createUser] Upsert returned no profile!");
            return { user: null, error: { message: "Profilo non creato in database" } };
          }
          
          console.log("[createUser] Upsert succeeded:", upsertProfile);
          return { user: profile, error: null };
        }
        
        console.log("[createUser] Direct insert succeeded:", insertedProfile);
        return { user: profile, error: null };
      } catch (error) {
        console.error('[createUser] Error in profile creation:', error);
        return { user: null, error: { message: "Errore durante la creazione del profilo" } };
      }
    }

    return { user: null, error: { message: "Creazione utente fallita" } };
  } catch (error) {
    console.error('[createUser] Critical error in createUser:', error);
    return { user: null, error };
  }
}

export async function updateUser(id: string, userData: Partial<UserFormData>): Promise<{ success: boolean; error: any }> {
  try {
    console.log("[updateUser] Updating user with ID:", id, "and data:", userData);
    console.log("[updateUser] Role being updated to:", userData.role);
    
    // 1. Update profile data
    const profileData: Partial<Profile> = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role
    };

    console.log("[updateUser] Profile data being sent to Supabase:", profileData);

    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id)
      .select();

    if (profileError) {
      console.error("[updateUser] Profile update error:", profileError);
      console.error("[updateUser] Full update error details:", JSON.stringify(profileError, null, 2));
      return { success: false, error: profileError };
    }

    console.log("[updateUser] Profile updated successfully:", updatedProfile);

    // 2. If password is provided, update it using the auth.updateUser API
    if (userData.password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: userData.password
      });

      if (passwordError) {
        console.error("[updateUser] Password update error:", passwordError);
        return { success: false, error: passwordError };
      }
      
      console.log("[updateUser] Password updated successfully");
    }

    console.log("[updateUser] User updated successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error('[updateUser] Error in updateUser:', error);
    return { success: false, error };
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error: any }> {
  try {
    console.log("[deleteUser] Deleting user with ID:", id);
    
    // Delete user from profiles table
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("[deleteUser] User deletion error:", error);
      console.error("[deleteUser] Full deletion error details:", JSON.stringify(error, null, 2));
      return { success: false, error };
    }
    
    console.log("[deleteUser] User deleted successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error('[deleteUser] Error in deleteUser:', error);
    return { success: false, error };
  }
}
