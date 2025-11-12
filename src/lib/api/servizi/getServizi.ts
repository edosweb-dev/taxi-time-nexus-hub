
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
      .order('data_servizio', { ascending: false })
      .order('orario_servizio', { ascending: false });

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
          created_by_referente_id,
          created_at
        )
      `)
      .eq('servizio_id', id)
      .order('created_at', { ascending: true });

    if (passeggeriError) {
      console.error('[getServizioById] Error fetching passeggeri:', passeggeriError);
      throw passeggeriError;
    }

    // ✅ Trasforma i dati unificando passeggeri permanenti e temporanei
    const passeggeri: PasseggeroConDettagli[] = (passeggeriData || []).map(item => {
      // CASO 1: Passeggero permanente (salvato in rubrica)
      if (item.salva_in_database && item.passeggeri) {
        return {
          ...item.passeggeri,
          orario_presa_personalizzato: item.orario_presa_personalizzato,
          luogo_presa_personalizzato: item.luogo_presa_personalizzato,
          destinazione_personalizzato: item.destinazione_personalizzato,
          usa_indirizzo_personalizzato: item.usa_indirizzo_personalizzato,
          tipo: 'permanente' as const,
        };
      } 
      // CASO 2: Passeggero temporaneo (ospite, dati inline)
      else {
        return {
          id: item.id, // ID del record servizi_passeggeri
          nome_cognome: item.nome_cognome_inline || '',
          email: item.email_inline || null,
          telefono: item.telefono_inline || null,
          localita: item.localita_inline || null,
          indirizzo: item.indirizzo_inline || null,
          orario_presa_personalizzato: item.orario_presa_personalizzato,
          luogo_presa_personalizzato: item.luogo_presa_personalizzato,
          destinazione_personalizzato: item.destinazione_personalizzato,
          usa_indirizzo_personalizzato: item.usa_indirizzo_personalizzato,
          tipo: 'temporaneo' as const,
          azienda_id: null as any,
          created_by_referente_id: null as any,
          created_at: null,
        };
      }
    });

    console.log('[getServizioById] Passeggeri loaded:', {
      total: passeggeri.length,
      permanenti: passeggeri.filter(p => p.tipo === 'permanente').length,
      temporanei: passeggeri.filter(p => p.tipo === 'temporaneo').length,
    });

    return { 
      servizio: servizio as Servizio || null, 
      passeggeri: passeggeri || [] 
    };
  } catch (error) {
    console.error('[getServizioById] Unexpected error:', error);
    throw error;
  }
}
