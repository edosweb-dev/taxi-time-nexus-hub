
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
    
    // SOLUZIONE: Usa fetch direttamente invece di invoke per garantire la serializzazione corretta
    console.log('[createUser] Sending request with fetch instead of invoke');
    
    // Pulisci l'oggetto userData da eventuali valori undefined
    const cleanUserData = JSON.parse(JSON.stringify(userData));
    console.log('[createUser] Cleaned userData:', cleanUserData);
    
    const response = await fetch('https://iczxhmzwjopfdvbxwzjs.supabase.co/functions/v1/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(cleanUserData)
    });
    
    console.log('[createUser] Fetch response status:', response.status);
    
    if (!response.ok) {
      console.error('[createUser] Error response status:', response.status);
      
      // Tentativo di leggere il corpo dell'errore
      let errorText = 'Errore nella richiesta';
      try {
        const errorData = await response.text();
        console.error('[createUser] Error response body:', errorData);
        
        try {
          const errorJson = JSON.parse(errorData);
          errorText = errorJson.message || errorJson.error || errorData;
        } catch (e) {
          errorText = errorData || `Errore HTTP ${response.status}`;
        }
      } catch (e) {
        console.error('[createUser] Error getting error response:', e);
      }
      
      throw new Error(`Errore nella creazione dell'utente: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('[createUser] Successful response data:', responseData);
    
    if (!responseData || !responseData.user) {
      console.error('[createUser] Invalid response from function:', responseData);
      throw new Error('Risposta non valida dalla funzione');
    }

    // Creiamo un oggetto profile per il feedback immediato nell'UI
    const profileData: Profile = {
      id: responseData.user.id,
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
