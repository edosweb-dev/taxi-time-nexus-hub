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
    .select('id, km_totali, ore_sosta, data_servizio, id_progressivo')
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
      console.log(`  - ${s.id_progressivo || s.id}: ${s.data_servizio} | ${s.km_totali}km | ${s.ore_sosta}h`);
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
  servizi: Array<{ id: string; km_totali: number | null; ore_sosta: number | null; data_servizio: string; id_progressivo?: string }>,
  anno: number
): Promise<{ totaleBaseKm: number; totaleOreAttesa: number; dettaglioServizi: string[] }> {
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
  const dettaglioServizi: string[] = [];

  // Calcola per OGNI servizio singolarmente
  for (const servizio of servizi) {
    const kmServizio = Number(servizio.km_totali) || 0;
    const oreServizio = Number(servizio.ore_sosta) || 0;

    // Calcola base KM per QUESTO servizio
    const risultato = calcolaBaseKmSingoloServizio(kmServizio, tariffeKm, config);
    
    totaleBaseKm += risultato.base;
    totaleOreAttesa += oreServizio;

    const dettaglio = `${servizio.id_progressivo || servizio.id.slice(0,8)}: ${kmServizio}km → €${risultato.base.toFixed(2)} (${risultato.modalita})`;
    dettaglioServizi.push(dettaglio);

    console.log(`[calcolaBaseKmPerServizi] Servizio ${servizio.id_progressivo || servizio.id.slice(0,8)}: ${risultato.dettaglio}`);
  }

  console.log(`[calcolaBaseKmPerServizi] TOTALE: €${totaleBaseKm.toFixed(2)} base, ${totaleOreAttesa}h attesa`);

  return {
    totaleBaseKm: Number(totaleBaseKm.toFixed(2)),
    totaleOreAttesa,
    dettaglioServizi
  };
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
          // Fetch tutti i servizi del mese
          const servizi = await fetchServiziMese(user.id, mese, anno);
          
          const numeroServizi = servizi.length;
          const kmTotali = servizi.reduce((sum, s) => sum + (Number(s.km_totali) || 0), 0);

          // Se non ci sono servizi, restituisci dati vuoti
          if (numeroServizi === 0 || kmTotali === 0) {
            console.log(`[getStipendiAutomaticiMese] ${user.first_name} ${user.last_name}: Nessun servizio o 0 km`);
            return {
              userId: user.id,
              firstName: user.first_name || '',
              lastName: user.last_name || '',
              role: user.role,
              numeroServizi,
              kmTotali,
              oreAttesa: 0,
              calcoloCompleto: null,
              stipendioEsistente,
              hasStipendioSalvato: !!stipendioEsistente,
            };
          }

          // NUOVA LOGICA: Calcola per singolo servizio
          const { totaleBaseKm, totaleOreAttesa, dettaglioServizi } = await calcolaBaseKmPerServizi(servizi, anno);

          console.log(`[getStipendiAutomaticiMese] ${user.first_name} ${user.last_name}:`);
          console.log(`  - ${numeroServizi} servizi, ${kmTotali} km totali`);
          console.log(`  - Base calcolata per singolo servizio: €${totaleBaseKm}`);
          dettaglioServizi.forEach(d => console.log(`    ${d}`));

          // Calcola lo stipendio completo usando i totali già calcolati per servizio
          // NOTA: passiamo i km totali per compatibilità, ma il calcolo effettivo
          // usa già la base calcolata per singolo servizio
          const calcoloCompleto = await calcolaStipendioCompleto({
            userId: user.id,
            mese,
            anno,
            km: kmTotali, // Per riferimento
            oreAttesa: totaleOreAttesa,
          });

          // Sovrascriviamo la baseKm con quella calcolata per singolo servizio
          // (la funzione calcolaStipendioCompleto calcola aggregato, noi vogliamo per servizio)
          const config = await fetchConfigurazioneStipendi(anno);
          if (config) {
            const baseConAumentoCorretta = Number((totaleBaseKm * config.coefficiente_aumento).toFixed(2));
            const importoOreAttesaCorretto = Number((totaleOreAttesa * config.tariffa_oraria_attesa).toFixed(2));
            const totaleLordoCorretto = Number((baseConAumentoCorretta + importoOreAttesaCorretto).toFixed(2));
            
            // Ricalcola netto con valori corretti (inclusi TUTTI i campi detrazioni)
            const detr = calcoloCompleto.detrazioni;
            const totaleNettoCorretto = Number((
              totaleLordoCorretto +
              detr.totaleSpesePersonali +
              detr.totaleVersamenti -
              detr.totalePrelievi -
              detr.incassiDaDipendenti -
              detr.incassiServiziContanti -
              detr.riportoMesePrecedente
            ).toFixed(2));

            // Aggiorna i valori nel risultato
            calcoloCompleto.baseKm = totaleBaseKm;
            calcoloCompleto.baseConAumento = baseConAumentoCorretta;
            calcoloCompleto.importoOreAttesa = importoOreAttesaCorretto;
            calcoloCompleto.totaleLordo = totaleLordoCorretto;
            calcoloCompleto.totaleNetto = totaleNettoCorretto;
            
            // Aggiorna dettaglio
            calcoloCompleto.dettaglioCalcolo.dettaglio = 
              `Calcolo per ${numeroServizi} servizi:\n${dettaglioServizi.join('\n')}`;
          }

          return {
            userId: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: user.role,
            numeroServizi,
            kmTotali,
            oreAttesa: totaleOreAttesa,
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
