import { supabase } from '@/lib/supabase';
import { PasseggeroConDettagli, Servizio, StatoServizio } from '@/lib/types/servizi';

interface ServiziFilters {
  stato?: StatoServizio;
  azienda_id?: string;
  assegnato_a?: string;
  data_inizio?: string;
  data_fine?: string;
}

export async function getServizi(filters?: ServiziFilters): Promise<Servizio[]> {
  console.log('🟤 [getServizi] Called with filters:', filters);
  
  try {
    let query = supabase
      .from('servizi')
      .select(`
        *,
        aziende:azienda_id (
          id,
          nome
        )
      `)
      .order('data_servizio', { ascending: false })
      .order('orario_servizio', { ascending: false });

    // Applica filtro stato
    if (filters?.stato) {
      console.log('✅ [getServizi] Applying stato filter:', filters.stato);
      query = query.eq('stato', filters.stato);
    } else {
      console.log('⚠️ [getServizi] NO stato filter (fetching all)');
    }

    // Altri filtri
    if (filters?.azienda_id) {
      query = query.eq('azienda_id', filters.azienda_id);
    }

    if (filters?.assegnato_a) {
      query = query.eq('assegnato_a', filters.assegnato_a);
    }

    if (filters?.data_inizio && filters?.data_fine) {
      query = query
        .gte('data_servizio', filters.data_inizio)
        .lte('data_servizio', filters.data_fine);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [getServizi] Query error:', error);
      throw error;
    }

    console.log('✅ [getServizi] Success - Results:', data?.length || 0);
    return data as Servizio[];
  } catch (error) {
    console.error('❌ [getServizi] Catch error:', error);
    throw error;
  }
}

export async function getServizioById(id: string): Promise<{ servizio: Servizio | null; passeggeri: PasseggeroConDettagli[] }> {
  try {
    // Get servizio with azienda data
    const { data: servizio, error: servizioError } = await supabase
      .from('servizi')
      .select(`
        *,
        aziende (
          id,
          nome,
          firma_digitale_attiva
        )
      `)
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
          nome,
          cognome,
          localita,
          indirizzo,
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
    const passeggeri: PasseggeroConDettagli[] = (passeggeriData || [])
      .filter(item => item.passeggeri) // Filtra solo elementi con passeggeri validi
      .map(item => ({
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
