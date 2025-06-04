
import { supabase } from '@/lib/supabase';
import { UserFormData } from './types';

export async function createUser(userData: UserFormData): Promise<{ user: any; error: any }> {
  try {
    console.log("[createUser] Creating user with data:", userData);
    
    // Chiama l'edge function per creare l'utente
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: userData
    });
    
    if (error) {
      console.error("[createUser] Edge function error:", error);
      return { user: null, error };
    }
    
    if (data?.error) {
      console.error("[createUser] Response error:", data.error);
      return { user: null, error: data.error };
    }
    
    console.log("[createUser] User created successfully:", data);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('[createUser] Unexpected error:', error);
    return { user: null, error };
  }
}
