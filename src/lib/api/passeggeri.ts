import { supabase } from '@/lib/supabase';

export interface Passeggero {
  id: string;
  azienda_id: string;
  created_by_referente_id: string | null;
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
      .eq('tipo', 'rubrica')  // ✅ Solo passeggeri permanenti in rubrica
      .order('nome_cognome', { ascending: true });

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
      .eq('created_by_referente_id', referenteId)
      .eq('tipo', 'rubrica')  // ✅ Solo passeggeri permanenti in rubrica
      .order('nome_cognome', { ascending: true });

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

export interface CreatePasseggeroData {
  azienda_id: string;
  created_by_referente_id?: string | null;
  nome_cognome: string;
  nome?: string;
  cognome?: string;
  email?: string;
  telefono?: string;
  localita?: string;
  indirizzo?: string;
}

export async function createPasseggero(data: CreatePasseggeroData): Promise<Passeggero> {
  try {
    console.log('[createPasseggero] Creating passenger:', data);
    const { data: passeggero, error } = await supabase
      .from('passeggeri')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('[createPasseggero] Error creating passenger:', error);
      throw error;
    }

    console.log('[createPasseggero] Successfully created passenger');
    return passeggero as Passeggero;
  } catch (error) {
    console.error('[createPasseggero] Unexpected error:', error);
    throw error;
  }
}

export async function updatePasseggero(id: string, data: Partial<CreatePasseggeroData>): Promise<Passeggero> {
  try {
    console.log('[updatePasseggero] Updating passenger:', id, data);
    const { data: passeggero, error } = await supabase
      .from('passeggeri')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updatePasseggero] Error updating passenger:', error);
      throw error;
    }

    console.log('[updatePasseggero] Successfully updated passenger');
    return passeggero as Passeggero;
  } catch (error) {
    console.error('[updatePasseggero] Unexpected error:', error);
    throw error;
  }
}

export async function deletePasseggero(id: string): Promise<void> {
  try {
    console.log('[deletePasseggero] Deleting passenger:', id);
    const { error } = await supabase
      .from('passeggeri')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[deletePasseggero] Error deleting passenger:', error);
      throw error;
    }

    console.log('[deletePasseggero] Successfully deleted passenger');
  } catch (error) {
    console.error('[deletePasseggero] Unexpected error:', error);
    throw error;
  }
}