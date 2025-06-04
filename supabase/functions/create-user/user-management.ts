import { UserCreationResult, UserData, UserProfileResult } from "./types.ts";

export async function createNewUser(supabase: any, userData: UserData): Promise<UserCreationResult> {
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

  // Creazione utente con metadati e password specifica
  console.log("Edge function: Creazione utente con ruolo:", userData.role);
  console.log("Edge function: Metadati user:", {
    first_name: userData.first_name,
    last_name: userData.last_name,
    role: userData.role,
    azienda_id: userData.azienda_id,
  });
  
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
  
  // Se la password era generata automaticamente, forza il reset password
  if (!userData.password) {
    console.log("Edge function: Invio email di reset password per password temporanea");
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: userData.email,
    });
    
    if (resetError) {
      console.error("Edge function: Errore nell'invio del reset password:", resetError);
      // Non blocchiamo la creazione dell'utente per questo errore
    } else {
      console.log("Edge function: Email di reset password inviata");
    }
  }
  
  return { user: authData.user, error: null };
}

export async function handleUserProfile(supabase: any, userId: string, userData: UserData): Promise<UserProfileResult> {
  // Prepare profile data
  const profileData = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    role: userData.role,
    azienda_id: userData.azienda_id
  };
  
  console.log("Edge function: Creazione profilo con dati:", profileData);

  // Check if profile exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileCheckError) {
    console.log("Edge function: Profilo non trovato, creazione manuale necessaria");
    
    // Create new profile
    const { data: newProfile, error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select();
      
    if (createProfileError) {
      console.error('Edge function: Errore nella creazione manuale del profilo:', createProfileError);
      return { profile: null, error: createProfileError.message };
    }
    
    console.log("Edge function: Nuovo profilo creato:", newProfile);
    return { profile: newProfile, error: null };
  } else {
    console.log("Edge function: Profilo esistente trovato:", existingProfile);
    
    // Update existing profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select();
      
    if (updateError) {
      console.error('Edge function: Errore nell\'aggiornamento del profilo:', updateError);
      return { profile: null, error: updateError.message };
    }
    
    console.log("Edge function: Profilo aggiornato:", updatedProfile);
    return { profile: updatedProfile, error: null };
  }
}
