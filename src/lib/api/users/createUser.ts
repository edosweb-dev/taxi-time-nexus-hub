
import { supabase } from '@/lib/supabase';
import { UserFormData } from './types';

export async function createUser(userData: UserFormData): Promise<{ user: any; error: any }> {
  try {
    console.log("[createUser] Creating user with data:", userData);
    
    // Verifica che i dati essenziali siano presenti
    if (!userData.email || !userData.first_name || !userData.last_name || !userData.role) {
      const missingFields = [];
      if (!userData.email) missingFields.push('email');
      if (!userData.first_name) missingFields.push('first_name');
      if (!userData.last_name) missingFields.push('last_name');
      if (!userData.role) missingFields.push('role');
      
      console.error("[createUser] Dati mancanti:", missingFields);
      return { user: null, error: `Dati mancanti: ${missingFields.join(', ')}` };
    }
    
    // Chiama l'edge function per creare l'utente
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: userData
    });
    
    if (error) {
      console.error("[createUser] Edge function error:", error);
      return { user: null, error: error.message || 'Errore nella chiamata all\'edge function' };
    }
    
    if (data?.error) {
      console.error("[createUser] Response error:", data.error);
      return { user: null, error: data.error };
    }
    
    if (!data?.user) {
      console.error("[createUser] Nessun utente restituito:", data);
      return { user: null, error: 'Nessun utente creato' };
    }
    
    console.log("[createUser] User created successfully:", data.user);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('[createUser] Unexpected error:', error);
    return { user: null, error: error.message || 'Errore imprevisto' };
  }
}
