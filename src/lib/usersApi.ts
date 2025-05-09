
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data as Profile[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
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
    // Log debug info
    console.log("Creating user with data:", userData);
    console.log("First name:", userData.first_name);
    console.log("Last name:", userData.last_name);
    console.log("Role being assigned:", userData.role);
    
    // Verifica se i campi richiesti sono presenti
    if (!userData.first_name || !userData.last_name || !userData.role) {
      console.error("Missing required fields:", { 
        first_name: userData.first_name, 
        last_name: userData.last_name, 
        role: userData.role 
      });
      return { user: null, error: { message: "Campi obbligatori mancanti" } };
    }
    
    // Crea l'utente con la funzione signUp
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
        // Creiamo un oggetto profilo sintetico per feedback immediato all'UI
        // e per garantire che i dati siano disponibili anche se il trigger DB fallisce
        const profile: Profile = {
          id: authData.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role
        };
        
        console.log("Created profile object for immediate UI feedback:", profile);
        
        // Eseguiamo un upsert esplicito nella tabella profiles
        // Questo è importante poiché il trigger potrebbe non funzionare come previsto
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
    
    // Delete user from auth - this should cascade to profiles table
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
