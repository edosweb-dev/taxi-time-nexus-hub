
import { supabase } from '@/lib/supabase';
import { UserFormData } from './types';
import { Profile } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

export async function createUser(userData: UserFormData) {
  try {
    // Dettagli per debug
    console.log('[createUser] Creating user with data:', userData);
    console.log('[createUser] First name:', userData.first_name);
    console.log('[createUser] Last name:', userData.last_name);
    console.log('[createUser] Email:', userData.email);
    console.log('[createUser] Role being assigned:', userData.role);
    if (userData.azienda_id) {
      console.log('[createUser] Azienda ID:', userData.azienda_id);
    } else if (userData.role === 'cliente') {
      console.error('[createUser] ERRORE: Tentativo di creare cliente senza azienda_id');
      throw new Error('Per gli utenti con ruolo cliente è necessario specificare azienda_id');
    }

    // Get current session token
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      throw new Error('Utente non autenticato');
    }

    // Debug per la chiamata alla Edge Function
    console.log('[createUser] Preparing to call edge function with data:', JSON.stringify(userData, null, 2));
    console.log('[createUser] Token length:', accessToken.length);
    
    // Validate JSON before sending
    const payload = JSON.stringify(userData);
    
    // Verify JSON is valid
    try {
      JSON.parse(payload);
      console.log('[createUser] JSON payload validation successful');
    } catch (e) {
      console.error('[createUser] Invalid JSON payload:', e);
      throw new Error('Dati utente non validi per la conversione in JSON');
    }
    
    // Chiamata alla Supabase Edge Function con corretto payload JSON
    console.log('[createUser] Sending request to edge function with payload:', payload);
    const response = await supabase.functions.invoke('create-user', {
      body: payload,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Log dettagliati per verificare la risposta
    if (response.error) {
      console.error('[createUser] Error invoking edge function:', response.error);
      console.error('[createUser] Error status:', response.error.status);
      console.error('[createUser] Error name:', response.error.name);
      
      // Tentativo di recuperare il corpo della risposta di errore
      let errorText = 'Corpo risposta non disponibile';
      try {
        if (response.error.response) {
          const rawText = await response.error.response.text();
          console.error('[createUser] Raw error response:', rawText);
          errorText = rawText;
          
          // Prova a parsare come JSON se possibile
          try {
            const errorJson = JSON.parse(rawText);
            console.error('[createUser] Parsed error JSON:', errorJson);
            if (errorJson.message || errorJson.error) {
              errorText = errorJson.message || errorJson.error;
            }
          } catch (parseErr) {
            console.error('[createUser] Error response is not valid JSON');
          }
        }
      } catch (e) {
        console.error('[createUser] Error getting response text:', e);
      }
      
      throw new Error(`Errore nella creazione dell'utente: ${errorText}`);
    }
    
    console.log('[createUser] Edge function response:', response.data);
    
    if (!response.data || !response.data.user) {
      console.error('[createUser] Invalid response from function:', response.data);
      throw new Error('Risposta non valida dalla funzione');
    }

    // Creiamo un oggetto profile per il feedback immediato nell'UI
    const profileData: Profile = {
      id: response.data.user.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      azienda_id: userData.azienda_id
    };
    
    console.log('[createUser] Created profile object for immediate UI feedback:', profileData);

    return { user: profileData, error: null };
  } catch (error) {
    console.error('[createUser] Unexpected error:', error);
    return { user: null, error };
  }
}
