
import { supabase } from '@/lib/supabase';
import { PasseggeroConDettagli, Servizio } from '@/lib/types/servizi';

export async function getServizi(): Promise<Servizio[]> {
  try {
    const { data, error } = await supabase
      .from('servizi')
      .select(`
        *,
        aziende:azienda_id (
          id,
          nome
        )
      `)
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

export async function getServizioById(id: string): Promise<{ servizio: Servizio | null; passeggeri: PasseggeroConDettagli[] }> {
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

    // Get passeggeri con dettagli del servizio tramite join
    const { data: passeggeriData, error: passeggeriError } = await supabase
      .from('servizi_passeggeri')
      .select(`
        *,
        passeggeri:passeggero_id (
          id,
          nome_cognome,
          email,
          telefono,
          azienda_id,
          referente_id,
          created_at
        )
      `)
      .eq('servizio_id', id)
      .order('created_at', { ascending: true });

    if (passeggeriError) {
      console.error('[getServizioById] Error fetching passeggeri:', passeggeriError);
      throw passeggeriError;
    }

    // Trasforma i dati per creare PasseggeroConDettagli
    const passeggeri: PasseggeroConDettagli[] = (passeggeriData || []).map(item => ({
      ...item.passeggeri,
      orario_presa_personalizzato: item.orario_presa_personalizzato,
      luogo_presa_personalizzato: item.luogo_presa_personalizzato,
      destinazione_personalizzato: item.destinazione_personalizzato,
      usa_indirizzo_personalizzato: item.usa_indirizzo_personalizzato,
    }));

    return { 
      servizio: servizio as Servizio || null, 
      passeggeri: passeggeri || [] 
    };
  } catch (error) {
    console.error('[getServizioById] Unexpected error:', error);
    throw error;
  }
}
