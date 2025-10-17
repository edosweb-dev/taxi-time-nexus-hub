import { supabase } from '@/lib/supabase';

export interface StipendioManualeDipendente {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  stipendioFisso: number;
  stipendioSalvato: {
    id: string;
    stato: string;
    totale_lordo: number;
    totale_netto: number;
  } | null;
  hasStipendioSalvato: boolean;
}

/**
 * Recupera i dipendenti con i loro stipendi manuali salvati per il mese
 */
export async function getStipendiDipendenti(
  mese: number,
  anno: number
): Promise<StipendioManualeDipendente[]> {
  console.log(`[getStipendiDipendenti] Recupero stipendi per ${mese}/${anno}`);

  try {
    // 1. Ottieni tutti i dipendenti
    const { data: dipendenti, error: dipendentiError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, stipendio_fisso')
      .eq('role', 'dipendente')
      .order('last_name', { ascending: true });

    if (dipendentiError) {
      console.error('[getStipendiDipendenti] Errore fetch dipendenti:', dipendentiError);
      throw dipendentiError;
    }

    if (!dipendenti || dipendenti.length === 0) {
      console.log('[getStipendiDipendenti] Nessun dipendente trovato');
      return [];
    }

    // 2. Ottieni gli stipendi già salvati per il mese
    const { data: stipendiSalvati, error: stipendiError } = await supabase
      .from('stipendi')
      .select('*')
      .eq('mese', mese)
      .eq('anno', anno)
      .in('user_id', dipendenti.map(d => d.id));

    if (stipendiError) {
      console.error('[getStipendiDipendenti] Errore fetch stipendi:', stipendiError);
    }

    const stipendiMap = new Map(
      (stipendiSalvati || []).map(s => [s.user_id, s])
    );

    // 3. Mappa i dipendenti con i loro stipendi
    const risultati: StipendioManualeDipendente[] = dipendenti.map((dipendente) => {
      const stipendioEsistente = stipendiMap.get(dipendente.id);

      return {
        userId: dipendente.id,
        firstName: dipendente.first_name || '',
        lastName: dipendente.last_name || '',
        role: dipendente.role,
        stipendioFisso: Number(dipendente.stipendio_fisso) || 0,
        stipendioSalvato: stipendioEsistente ? {
          id: stipendioEsistente.id,
          stato: stipendioEsistente.stato,
          totale_lordo: stipendioEsistente.totale_lordo || 0,
          totale_netto: stipendioEsistente.totale_netto || 0,
        } : null,
        hasStipendioSalvato: !!stipendioEsistente,
      };
    });

    console.log(`[getStipendiDipendenti] Recuperati ${risultati.length} dipendenti`);
    return risultati;
  } catch (error) {
    console.error('[getStipendiDipendenti] Errore generale:', error);
    throw error;
  }
}
