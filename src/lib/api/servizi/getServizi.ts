
import { supabase } from '@/lib/supabase';
import { Passeggero, Servizio } from '@/lib/types/servizi';

export async function getServizi(): Promise<Servizio[]> {
  try {
    const { data, error } = await supabase
      .from('servizi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getServizi] Error fetching servizi:', error);
      throw error;
    }

    return data as Servizio[];
  } catch (error) {
    console.error('[getServizi] Unexpected error:', error);
    throw error;
  }
}

export async function getServizioById(id: string): Promise<{ servizio: Servizio | null; passeggeri: Passeggero[] }> {
  try {
    // Get servizio
    const { data: servizio, error: servizioError } = await supabase
      .from('servizi')
      .select('*')
      .eq('id', id)
      .single();

    if (servizioError) {
      console.error('[getServizioById] Error fetching servizio:', servizioError);
      throw servizioError;
    }

    // Get passeggeri
    const { data: passeggeri, error: passeggeriError } = await supabase
      .from('passeggeri')
      .select('*')
      .eq('servizio_id', id)
      .order('orario_presa', { ascending: true });

    if (passeggeriError) {
      console.error('[getServizioById] Error fetching passeggeri:', passeggeriError);
      throw passeggeriError;
    }

    return { 
      servizio: servizio as Servizio || null, 
      passeggeri: passeggeri as Passeggero[] || [] 
    };
  } catch (error) {
    console.error('[getServizioById] Unexpected error:', error);
    throw error;
  }
}
