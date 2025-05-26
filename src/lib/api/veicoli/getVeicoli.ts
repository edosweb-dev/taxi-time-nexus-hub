
import { supabase } from '@/lib/supabase';
import { Veicolo } from '@/lib/types/veicoli';

export async function getVeicoli(): Promise<Veicolo[]> {
  try {
    const { data, error } = await supabase
      .from('veicoli')
      .select('*')
      .order('modello', { ascending: true });

    if (error) {
      console.error('[getVeicoli] Error fetching veicoli:', error);
      throw error;
    }

    return data as Veicolo[];
  } catch (error) {
    console.error('[getVeicoli] Unexpected error:', error);
    throw error;
  }
}

export async function getVeicoliAttivi(): Promise<Veicolo[]> {
  try {
    const { data, error } = await supabase
      .from('veicoli')
      .select('*')
      .eq('attivo', true)
      .order('modello', { ascending: true });

    if (error) {
      console.error('[getVeicoliAttivi] Error fetching veicoli attivi:', error);
      throw error;
    }

    return data as Veicolo[];
  } catch (error) {
    console.error('[getVeicoliAttivi] Unexpected error:', error);
    throw error;
  }
}

export async function getVeicoloById(id: string): Promise<Veicolo | null> {
  try {
    const { data, error } = await supabase
      .from('veicoli')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[getVeicoloById] Error fetching veicolo:', error);
      throw error;
    }

    return data as Veicolo;
  } catch (error) {
    console.error('[getVeicoloById] Unexpected error:', error);
    throw error;
  }
}
