
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';
import { UserFormData } from './types';

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

    // Rimossa la verifica dell'email già registrata tramite admin.listUsers
    // che causava l'errore "User not allowed"
    
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
        
        // Verifichiamo se l'handle_new_user ha creato automaticamente il profilo
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
