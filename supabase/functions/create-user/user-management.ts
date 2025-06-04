
import { UserCreationResult, UserData, UserProfileResult } from "./types.ts";

export async function createNewUser(supabase: any, userData: UserData): Promise<UserCreationResult> {
  try {
    // Se non è fornita una password, genera una password temporanea
    const password = userData.password || `TempPass${Math.random().toString(36).substring(2, 8).toUpperCase()}!${new Date().getFullYear()}`;
    
    console.log("Edge function: Creazione utente con email:", userData.email);
    console.log("Edge function: Password:", userData.password ? "Fornita dall'utente" : "Generata temporaneamente");
    
    // Verifica che l'azienda esista se è stato fornito un azienda_id
    if (userData.azienda_id) {
      const { data: azienda, error: aziendaError } = await supabase
        .from('aziende')
        .select('id')
        .eq('id', userData.azienda_id)
        .single();
      
      if (aziendaError || !azienda) {
        console.error("Edge function: Errore nella verifica dell'azienda:", aziendaError);
        return { user: null, error: "L'azienda specificata non esiste" };
      }
      
      console.log("Edge function: Azienda verificata:", userData.azienda_id);
    } else if (userData.role === 'cliente') {
      console.error("Edge function: Tentativo di creare utente cliente senza azienda_id");
      return { user: null, error: "Per gli utenti con ruolo cliente è necessario specificare azienda_id" };
    }

    // Creazione utente usando il service role per bypassare RLS
    console.log("Edge function: Creazione utente con ruolo:", userData.role);
    
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        azienda_id: userData.azienda_id,
      },
    });

    if (createError) {
      console.error('Edge function: Errore nella creazione dell\'utente:', createError);
      return { user: null, error: createError.message };
    }

    console.log("Edge function: Utente creato con successo:", authData.user.id);
    
    // Se la password era generata automaticamente, invia email di reset
    if (!userData.password) {
      console.log("Edge function: Invio email di reset password per password temporanea");
      try {
        const { error: resetError } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: userData.email,
        });
        
        if (resetError) {
          console.error("Edge function: Errore nell'invio del reset password:", resetError);
        } else {
          console.log("Edge function: Email di reset password inviata");
        }
      } catch (resetErr) {
        console.error("Edge function: Errore durante invio reset:", resetErr);
      }
    }
    
    return { user: authData.user, error: null };
  } catch (error) {
    console.error('Edge function: Errore imprevisto in createNewUser:', error);
    return { user: null, error: `Errore imprevisto: ${error.message}` };
  }
}

export async function handleUserProfile(supabase: any, userId: string, userData: UserData): Promise<UserProfileResult> {
  try {
    // Prepare profile data
    const profileData = {
      id: userId, // Esplicitamente impostiamo l'ID
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      email: userData.email,
      azienda_id: userData.azienda_id || null
    };
    
    console.log("Edge function: Creazione profilo con dati:", profileData);

    // Crea sempre un nuovo profilo (upsert per gestire eventuali conflitti)
    const { data: newProfile, error: createProfileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })
      .select()
      .single();
      
    if (createProfileError) {
      console.error('Edge function: Errore nella creazione del profilo:', createProfileError);
      return { profile: null, error: createProfileError.message };
    }
    
    console.log("Edge function: Profilo creato/aggiornato:", newProfile);
    return { profile: newProfile, error: null };
    
  } catch (error) {
    console.error('Edge function: Errore imprevisto in handleUserProfile:', error);
    return { profile: null, error: `Errore imprevisto: ${error.message}` };
  }
}
