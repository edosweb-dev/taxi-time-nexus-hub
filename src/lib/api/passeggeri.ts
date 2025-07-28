import { supabase } from '@/lib/supabase';

export interface Passeggero {
  id: string;
  azienda_id: string;
  referente_id: string | null;
  nome_cognome: string;
  nome: string | null;
  cognome: string | null;
  email: string | null;
  telefono: string | null;
  localita: string | null;
  indirizzo: string | null;
  created_at: string;
}

export async function getPasseggeriByAzienda(aziendaId: string): Promise<Passeggero[]> {
  try {
    console.log(`[getPasseggeriByAzienda] Fetching passengers for company: ${aziendaId}`);
    const { data, error } = await supabase
      .from('passeggeri')
      .select('*')
      .eq('azienda_id', aziendaId)
      .order('nome_cognome');

    if (error) {
      console.error('[getPasseggeriByAzienda] Error fetching passengers:', error);
      throw error;
    }

    console.log(`[getPasseggeriByAzienda] Successfully fetched ${data.length} passengers`);
    return data as Passeggero[];
  } catch (error) {
    console.error('[getPasseggeriByAzienda] Unexpected error:', error);
    throw error;
  }
}

export async function getPasseggeriByReferente(aziendaId: string, referenteId: string): Promise<Passeggero[]> {
  try {
    console.log(`[getPasseggeriByReferente] Fetching passengers for referente: ${referenteId}`);
    const { data, error } = await supabase
      .from('passeggeri')
      .select('*')
      .eq('azienda_id', aziendaId)
      .eq('referente_id', referenteId)
      .order('nome_cognome');

    if (error) {
      console.error('[getPasseggeriByReferente] Error fetching passengers:', error);
      throw error;
    }

    console.log(`[getPasseggeriByReferente] Successfully fetched ${data.length} passengers`);
    return data as Passeggero[];
  } catch (error) {
    console.error('[getPasseggeriByReferente] Unexpected error:', error);
    throw error;
  }
}