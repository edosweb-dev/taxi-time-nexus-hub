import { supabase } from '@/lib/supabase';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

export async function getConducentiEsterni(): Promise<ConducenteEsterno[]> {
  const { data, error } = await supabase
    .from('conducenti_esterni')
    .select('*')
    .order('nome_cognome');

  if (error) {
    console.error('Error fetching conducenti esterni:', error);
    throw new Error(`Errore nel caricamento dei conducenti esterni: ${error.message}`);
  }

  return data || [];
}

export async function getConducentiEsterniAttivi(): Promise<ConducenteEsterno[]> {
  const { data, error } = await supabase
    .from('conducenti_esterni')
    .select('*')
    .eq('attivo', true)
    .order('nome_cognome');

  if (error) {
    console.error('Error fetching conducenti esterni attivi:', error);
    throw new Error(`Errore nel caricamento dei conducenti esterni: ${error.message}`);
  }

  return data || [];
}

export async function getConducenteEsterno(id: string): Promise<ConducenteEsterno | null> {
  const { data, error } = await supabase
    .from('conducenti_esterni')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching conducente esterno:', error);
    throw new Error(`Errore nel caricamento del conducente esterno: ${error.message}`);
  }

  return data;
}