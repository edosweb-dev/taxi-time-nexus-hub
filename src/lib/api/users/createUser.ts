
import { supabase } from '@/lib/supabase';
import { UserFormData } from './types';
import { Profile } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

export async function createUser(userData: UserFormData) {
  try {
    // Detailed logging for debugging
    console.log('[createUser] Creating user with data:', JSON.stringify(userData, null, 2));
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

    // IMPORTANTE: assicurarsi che userData non sia null o vuoto
    if (!userData || Object.keys(userData).length === 0) {
      console.error('[createUser] ERRORE: userData è null o vuoto');
      throw new Error('I dati utente non possono essere vuoti');
    }

    // Debug avanzato - esplicitare il tipo di dato che si sta inviando
    console.log('[createUser] userData type:', typeof userData);
    console.log('[createUser] userData keys:', Object.keys(userData));
    
    // Verifica che tutti i campi obbligatori siano presenti
    if (!userData.first_name || !userData.last_name || !userData.email || !userData.role) {
      console.error('[createUser] Campi obbligatori mancanti');
      const missing = [];
      if (!userData.first_name) missing.push('first_name');
      if (!userData.last_name) missing.push('last_name');
      if (!userData.email) missing.push('email');
      if (!userData.role) missing.push('role');
      throw new Error(`Campi obbligatori mancanti: ${missing.join(', ')}`);
    }
    
    // Richiesta alla Edge Function - passaggio corretto del body come oggetto JavaScript
    console.log('[createUser] Invoking edge function with userData object');
    const response = await supabase.functions.invoke('create-user', {
      body: userData, // Passare l'oggetto direttamente
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
