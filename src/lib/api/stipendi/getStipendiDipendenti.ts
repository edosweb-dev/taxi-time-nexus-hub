import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface StipendioManualeDipendente {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  stipendioFisso: number;
  // Nuovi campi per metriche servizi
  numeroServizi: number;
  oreLavorate: number;
  oreFatturate: number;
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
 * e le metriche dei servizi svolti (numero, ore lavorate, ore fatturate)
 */
export async function getStipendiDipendenti(
  mese: number,
  anno: number
): Promise<StipendioManualeDipendente[]> {
  console.log(`[getStipendiDipendenti] ===== INIZIO =====`);
  console.log(`[getStipendiDipendenti] Parametri: mese=${mese}, anno=${anno}`);

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

    console.log(`[getStipendiDipendenti] Dipendenti trovati: ${dipendenti?.length || 0}`);
    
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

    // 3. Calcola date inizio/fine mese per query servizi
    const inizioMese = format(startOfMonth(new Date(anno, mese - 1)), 'yyyy-MM-dd');
    const fineMese = format(endOfMonth(new Date(anno, mese - 1)), 'yyyy-MM-dd');

    console.log(`[getStipendiDipendenti] Range date: ${inizioMese} - ${fineMese}`);
    console.log(`[getStipendiDipendenti] IDs dipendenti per query:`, dipendenti.map(d => d.id));

    // 4. Ottieni i servizi per ogni dipendente nel mese
    const { data: serviziData, error: serviziError } = await supabase
      .from('servizi')
      .select('assegnato_a, ore_sosta')
      .in('assegnato_a', dipendenti.map(d => d.id))
      .gte('data_servizio', inizioMese)
      .lte('data_servizio', fineMese)
      .in('stato', ['consuntivato', 'fatturato', 'completato']);

    if (serviziError) {
      console.error('[getStipendiDipendenti] Errore fetch servizi:', serviziError);
    }

    console.log(`[getStipendiDipendenti] Servizi trovati: ${serviziData?.length || 0}`);
    console.log(`[getStipendiDipendenti] Servizi raw:`, serviziData);

    // 5. Aggrega i dati servizi per dipendente
    const serviziPerDipendente = new Map<string, { count: number; oreTotali: number }>();
    
    (serviziData || []).forEach(servizio => {
      if (servizio.assegnato_a) {
        const current = serviziPerDipendente.get(servizio.assegnato_a) || { count: 0, oreTotali: 0 };
        current.count += 1;
        current.oreTotali += Number(servizio.ore_sosta || 0);
        serviziPerDipendente.set(servizio.assegnato_a, current);
      }
    });

    console.log(`[getStipendiDipendenti] Aggregazione:`, 
      Array.from(serviziPerDipendente.entries()).map(([id, data]) => ({id, ...data}))
    );

    // 6. Mappa i dipendenti con tutti i dati
    console.log(`[getStipendiDipendenti] ===== MAPPING DETTAGLIATO =====`);
    
    const risultati: StipendioManualeDipendente[] = dipendenti.map((dipendente) => {
      const stipendioEsistente = stipendiMap.get(dipendente.id);
      const serviziInfo = serviziPerDipendente.get(dipendente.id);
      
      // Debug: mostra cosa trova per ogni dipendente
      console.log(`[getStipendiDipendenti] Dipendente ${dipendente.first_name} ${dipendente.last_name} (${dipendente.id}):`, {
        serviziInfoTrovato: !!serviziInfo,
        serviziInfo: serviziInfo,
        count: serviziInfo?.count ?? 'N/A',
        oreTotali: serviziInfo?.oreTotali ?? 'N/A'
      });

      const finalServiziInfo = serviziInfo || { count: 0, oreTotali: 0 };

      return {
        userId: dipendente.id,
        firstName: dipendente.first_name || '',
        lastName: dipendente.last_name || '',
        role: dipendente.role,
        stipendioFisso: Number(dipendente.stipendio_fisso) || 0,
        // Nuovi campi
        numeroServizi: finalServiziInfo.count,
        oreLavorate: finalServiziInfo.oreTotali,
        oreFatturate: finalServiziInfo.oreTotali, // Per ora stesso valore
        stipendioSalvato: stipendioEsistente ? {
          id: stipendioEsistente.id,
          stato: stipendioEsistente.stato,
          totale_lordo: stipendioEsistente.totale_lordo || 0,
          totale_netto: stipendioEsistente.totale_netto || 0,
        } : null,
        hasStipendioSalvato: !!stipendioEsistente,
      };
    });

    console.log(`[getStipendiDipendenti] Risultati finali:`, 
      risultati.map(r => ({
        nome: `${r.firstName} ${r.lastName}`,
        servizi: r.numeroServizi,
        oreLavorate: r.oreLavorate
      }))
    );
    console.log(`[getStipendiDipendenti] ===== FINE =====`);
    return risultati;
  } catch (error) {
    console.error('[getStipendiDipendenti] Errore generale:', error);
    throw error;
  }
}
