
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
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: payload,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Log dettagliati per verificare la risposta
    if (error) {
      console.error('[createUser] Error invoking edge function:', error);
      console.error('[createUser] Error details:', JSON.stringify(error, null, 2));
      
      // Estrai messaggio di errore, se disponibile dalla risposta dell'Edge Function
      let errorMessage = 'Errore nella creazione dell\'utente';
      
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      // Se c'è un messaggio personalizzato dalla funzione Edge, usalo
      if (typeof error.message === 'string' && error.message.includes('message')) {
        try {
          const parsedError = JSON.parse(error.message);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          }
        } catch (e) {
          // Se il parsing fallisce, usa il messaggio originale
          console.error('[createUser] Error parsing error message:', e);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    console.log('[createUser] Edge function response:', data);
    
    if (!data || !data.user) {
      console.error('[createUser] Invalid response from function:', data);
      throw new Error('Risposta non valida dalla funzione');
    }

    // Creiamo un oggetto profile per il feedback immediato nell'UI
    const profileData: Profile = {
      id: data.user.id,
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
