
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';

export async function getUsers(): Promise<Profile[]> {
  try {
    // Log debug completi
    console.log("[getUsers] Iniziando il recupero degli utenti dalla tabella profiles");
    
    // Log della query che verrà eseguita senza toJSON() che causa errore
    const query = supabase.from('profiles').select('*').order('last_name', { ascending: true });
    console.log("[getUsers] Query in esecuzione:", "SELECT * FROM profiles ORDER BY last_name ASC");
    
    const { data, error } = await query;

    if (error) {
      console.error('[getUsers] Errore nel recupero degli utenti:', error);
      console.error('[getUsers] Dettagli completi errore:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('[getUsers] Nessun utente trovato nel database');
    } else {
      console.log(`[getUsers] Recuperati ${data.length} utenti dal database`);
      console.log('[getUsers] Struttura dati utente:', JSON.stringify(data[0], null, 2));
      
      // Verifichiamo i valori effettivi dei campi critici
      const missingFirstNames = data.filter(user => !user.first_name).length;
      const missingLastNames = data.filter(user => !user.last_name).length;
      const roleDistribution = data.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`[getUsers] Utenti senza first_name: ${missingFirstNames}`);
      console.log(`[getUsers] Utenti senza last_name: ${missingLastNames}`);
      console.log(`[getUsers] Distribuzione dei ruoli:`, roleDistribution);
    }
    
    return data as Profile[] || [];
  } catch (error) {
    console.error('[getUsers] Errore critico durante il recupero degli utenti:', error);
    // Ritorniamo un array vuoto invece di far fallire l'intera applicazione
    return [];
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
