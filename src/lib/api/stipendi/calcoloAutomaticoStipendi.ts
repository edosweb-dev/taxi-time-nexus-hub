import { supabase } from '@/lib/supabase';
import { calcolaStipendioCompleto, CalcoloStipendioCompleto } from './calcolaStipendio';
import { fetchTariffeKm, fetchConfigurazioneStipendi, calcolaBaseKmSingoloServizio } from './configurazione';

export interface StipendiAutomaticoUtente {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  numeroServizi: number;
  kmTotali: number;
  oreAttesa: number;
  calcoloCompleto: CalcoloStipendioCompleto | null;
  stipendioEsistente: any | null;
  hasStipendioSalvato: boolean;
}

/**
 * Genera date di filtro per un mese specifico
 * FIX: Gestisce correttamente il passaggio anno (es. Dicembre → Gennaio)
 */
function getDateRangeMese(mese: number, anno: number): { startDate: string; endDate: string } {
  // Primo giorno del mese
  const startDate = `${anno}-${String(mese).padStart(2, '0')}-01`;
  
  // Ultimo giorno del mese (usando il trucco del giorno 0 del mese successivo)
  const lastDay = new Date(anno, mese, 0).getDate();
  const endDate = `${anno}-${String(mese).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  console.log(`[getDateRangeMese] Mese ${mese}/${anno}: ${startDate} → ${endDate}`);
  return { startDate, endDate };
}

/**
 * Fetch servizi completati/consuntivati per un utente in un mese specifico
 * Include tutti i dati necessari per il calcolo per singolo servizio
 */
async function fetchServiziMese(userId: string, mese: number, anno: number) {
  const { startDate, endDate } = getDateRangeMese(mese, anno);

  console.log(`[fetchServiziMese] Fetch servizi per user ${userId}, range: ${startDate} - ${endDate}`);

  const { data: servizi, error } = await supabase
    .from('servizi')
    .select('id, km_totali, ore_sosta, ore_attesa_socio, data_servizio, id_progressivo')
    .eq('assegnato_a', userId)
    .in('stato', ['completato', 'consuntivato'])
    .gte('data_servizio', startDate)
    .lte('data_servizio', endDate)
    .order('data_servizio', { ascending: true });

  if (error) {
    console.error('[fetchServiziMese] Errore:', error);
    throw error;
  }

  // Log per debug - mostra quali servizi sono stati inclusi
  if (servizi && servizi.length > 0) {
    console.log(`[fetchServiziMese] Trovati ${servizi.length} servizi:`);
    servizi.forEach(s => {
      console.log(`  - ${s.id_progressivo || s.id}: ${s.data_servizio} | ${s.km_totali}km | sosta:${s.ore_sosta}h | attesa_socio:${s.ore_attesa_socio}h`);
    });
  } else {
    console.log(`[fetchServiziMese] Nessun servizio trovato per ${mese}/${anno}`);
  }

  return servizi || [];
}

/**
 * NUOVA LOGICA: Calcola base KM per OGNI servizio singolarmente
 * poi somma i risultati
 */
async function calcolaBaseKmPerServizi(
  servizi: Array<{ id: string; km_totali: number | null; ore_sosta: number | null; ore_attesa_socio: number | null; data_servizio: string; id_progressivo?: string }>,
  anno: number
): Promise<{ totaleBaseKm: number; totaleOreAttesa: number; totaleOreAttesaSocio: number; dettaglioServizi: string[] }> {
  // Fetch configurazione e tariffe una sola volta
  const [config, tariffeKm] = await Promise.all([
    fetchConfigurazioneStipendi(anno),
    fetchTariffeKm(anno)
  ]);

  if (!config) {
    throw new Error(`Configurazione stipendi non trovata per anno ${anno}`);
  }

  if (!tariffeKm.length) {
    throw new Error(`Nessuna tariffa KM trovata per anno ${anno}`);
  }

  console.log(`[calcolaBaseKmPerServizi] Config anno ${anno}:`, {
    coefficiente: config.coefficiente_aumento,
    tariffaOraria: config.tariffa_oraria_attesa,
    tariffaOltre200: config.tariffa_oltre_200km
  });
  console.log(`[calcolaBaseKmPerServizi] Tariffe caricate: ${tariffeKm.length} scaglioni`);

  let totaleBaseKm = 0;
  let totaleOreAttesa = 0;
  let totaleOreAttesaSocio = 0;
  const dettaglioServizi: string[] = [];

  // Calcola per OGNI servizio singolarmente
  for (const servizio of servizi) {
    const kmServizio = Number(servizio.km_totali) || 0;
    const oreServizio = Number(servizio.ore_sosta) || 0;
    const oreAttesaSocioServizio = Number(servizio.ore_attesa_socio) || 0;

    // Calcola base KM per QUESTO servizio
    const risultato = calcolaBaseKmSingoloServizio(kmServizio, tariffeKm, config);
    
    totaleBaseKm += risultato.base;
    totaleOreAttesa += oreServizio;
    totaleOreAttesaSocio += oreAttesaSocioServizio;

    const dettaglio = `${servizio.id_progressivo || servizio.id.slice(0,8)}: ${kmServizio}km → €${risultato.base.toFixed(2)} (${risultato.modalita})`;
    dettaglioServizi.push(dettaglio);

    console.log(`[calcolaBaseKmPerServizi] Servizio ${servizio.id_progressivo || servizio.id.slice(0,8)}: ${risultato.dettaglio}`);
  }

  console.log(`[calcolaBaseKmPerServizi] TOTALE: €${totaleBaseKm.toFixed(2)} base, ${totaleOreAttesa}h sosta, ${totaleOreAttesaSocio}h attesa socio`);

  return {
    totaleBaseKm: Number(totaleBaseKm.toFixed(2)),
    totaleOreAttesa,
    totaleOreAttesaSocio,
    dettaglioServizi
  };
}

/**
 * Calcolo dello stipendio di un socio/admin per un mese: UNICA formula usata
 * sia dalla pagina Stipendi (calcolo dal vivo) sia dal salvataggio in
 * `stipendi` (ricalcolaStipendioMese).
 *
 * - La base km si calcola su OGNI servizio con la tabella tariffe e poi si
 *   somma, mai sui km totali del mese.
 * - Le ore di attesa del socio contano anche se i km del mese sono zero.
 * - Detrazioni e riporto vengono da calcolaStipendioCompleto.
 */
export async function calcolaStipendioSocioMese(
  userId: string,
  mese: number,
  anno: number
): Promise<{
  numeroServizi: number;
  kmTotali: number;
  oreAttesaSocio: number;
  calcoloCompleto: CalcoloStipendioCompleto;
}> {
  const servizi = await fetchServiziMese(userId, mese, anno);
  const numeroServizi = servizi.length;
  const kmTotali = servizi.reduce((sum, s) => sum + (Number(s.km_totali) || 0), 0);

  // Detrazioni, riporto e configurazione. km: 0 perche' la base km
  // si sostituisce subito sotto con quella calcolata per servizio.
  const calcoloCompleto = await calcolaStipendioCompleto({
    userId,
    mese,
    anno,
    km: 0,
    oreAttesa: 0,
  });

  let totaleBaseKm = 0;
  let oreAttesaSocio = 0;
  let dettaglioServizi: string[] = [];
  if (numeroServizi > 0) {
    const r = await calcolaBaseKmPerServizi(servizi, anno);
    totaleBaseKm = r.totaleBaseKm;
    oreAttesaSocio = r.totaleOreAttesaSocio;
    dettaglioServizi = r.dettaglioServizi;
  }

  const config = calcoloCompleto.dettaglioCalcolo.configurazione;
  const coefficiente = Number(config.coefficiente_aumento);
  const tariffaOraria = Number(config.tariffa_oraria_attesa);

  const baseConAumento = Number((totaleBaseKm * coefficiente).toFixed(2));
  const importoOreAttesa = Number((oreAttesaSocio * tariffaOraria).toFixed(2));
  const totaleLordo = Number((baseConAumento + importoOreAttesa).toFixed(2));

  // Formula del netto allineata al modello del cliente (vedi calcolaStipendio.ts)
  const detr = calcoloCompleto.detrazioni;
  const totaleNetto = Number((
    totaleLordo +
    detr.riportoMesePrecedente +
    detr.totaleSpesePersonali +
    detr.totaleSpeseSocio +
    detr.totaleVersamenti -
    detr.totalePrelievi -
    detr.incassiDaDipendenti -
    detr.incassiPersonali
  ).toFixed(2));

  calcoloCompleto.baseKm = totaleBaseKm;
  calcoloCompleto.baseConAumento = baseConAumento;
  calcoloCompleto.importoOreAttesa = importoOreAttesa;
  calcoloCompleto.totaleLordo = totaleLordo;
  calcoloCompleto.totaleNetto = totaleNetto;
  calcoloCompleto.dettaglioCalcolo.parametriInput.km = kmTotali;
  calcoloCompleto.dettaglioCalcolo.parametriInput.oreAttesa = oreAttesaSocio;
  calcoloCompleto.dettaglioCalcolo.dettaglio = numeroServizi === 0
    ? 'Nessun servizio nel mese'
    : `Calcolo per ${numeroServizi} servizi:\n${dettaglioServizi.join('\n')}`;

  return { numeroServizi, kmTotali, oreAttesaSocio, calcoloCompleto };
}

/**
 * Ottiene admin e soci con i loro stipendi calcolati automaticamente dai servizi
 * I dipendenti hanno stipendio manuale e non vengono inclusi qui
 * 
 * LOGICA AGGIORNATA:
 * - Calcola base KM per OGNI servizio singolarmente
 * - Somma le basi dei singoli servizi
 * - Applica coefficiente al totale
 */
export async function getStipendiAutomaticiMese(
  mese: number, 
  anno: number
): Promise<StipendiAutomaticoUtente[]> {
  console.log(`[getStipendiAutomaticiMese] ====== Calcolo stipendi ${mese}/${anno} ======`);

  try {
    // 1. Ottieni solo admin e soci (dipendenti hanno stipendio manuale)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .in('role', ['admin', 'socio'])
      .order('last_name', { ascending: true });

    if (usersError) {
      console.error('[getStipendiAutomaticiMese] Errore fetch users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('[getStipendiAutomaticiMese] Nessun utente trovato');
      return [];
    }

    // 2. Ottieni gli stipendi già salvati per il mese
    const { data: stipendiSalvati, error: stipendiError } = await supabase
      .from('stipendi')
      .select('*')
      .eq('mese', mese)
      .eq('anno', anno);

    if (stipendiError) {
      console.error('[getStipendiAutomaticiMese] Errore fetch stipendi:', stipendiError);
    }

    const stipendiMap = new Map(
      (stipendiSalvati || []).map(s => [s.user_id, s])
    );

    // 3. Per ogni admin/socio, calcola lo stipendio con la NUOVA logica
    const risultati: StipendiAutomaticoUtente[] = await Promise.all(
      users.map(async (user) => {
        const stipendioEsistente = stipendiMap.get(user.id);

        try {
          const { numeroServizi, kmTotali, oreAttesaSocio, calcoloCompleto } =
            await calcolaStipendioSocioMese(user.id, mese, anno);

          return {
            userId: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: user.role,
            numeroServizi,
            kmTotali,
            oreAttesa: oreAttesaSocio,
            calcoloCompleto,
            stipendioEsistente,
            hasStipendioSalvato: !!stipendioEsistente,
          };
        } catch (error) {
          console.error(`[getStipendiAutomaticiMese] Errore calcolo per user ${user.id}:`, error);
          return {
            userId: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: user.role,
            numeroServizi: 0,
            kmTotali: 0,
            oreAttesa: 0,
            calcoloCompleto: null,
            stipendioEsistente,
            hasStipendioSalvato: !!stipendioEsistente,
          };
        }
      })
    );

    console.log(`[getStipendiAutomaticiMese] ====== Calcolati ${risultati.length} stipendi ======`);
    return risultati;
  } catch (error) {
    console.error('[getStipendiAutomaticiMese] Errore generale:', error);
    throw error;
  }
}
