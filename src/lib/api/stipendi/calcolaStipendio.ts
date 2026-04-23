
import { supabase } from '@/lib/supabase';
import { ConfigurazioneStipendi } from './types';
import { calcolaBaseKm } from './configurazione';

export interface CalcoloStipendioParams {
  userId: string;
  mese: number;
  anno: number;
  km: number;
  oreAttesa: number;
  oreEffettive?: number;
}

export interface DetrazioniStipendio {
  totaleSpesePersonali: number;
  totaleSpeseSocio: number;
  totalePrelievi: number;
  totaleVersamenti: number;
  totaleSpeseAnticipate: number;
  incassiDaDipendenti: number;
  incassiPersonali: number;
  riportoMesePrecedente: number;
}

export interface CalcoloStipendioCompleto {
  baseKm: number;
  baseConAumento: number;
  importoOreAttesa: number;
  totaleLordo: number;
  detrazioni: DetrazioniStipendio;
  totaleNetto: number;
  dettaglioCalcolo: {
    modalitaCalcolo: 'tabella' | 'lineare';
    dettaglio: string;
    configurazione: ConfigurazioneStipendi;
    parametriInput: {
      km: number;
      oreAttesa: number;
      coefficiente: number;
      tariffaOraria: number;
    };
  };
}

/**
 * Recupera incassi da servizi contanti per admin/soci
 */
async function getIncassiServiziContanti(
  userId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  console.log(`[getIncassiServiziContanti] Fetching per user ${userId} da ${startDate} a ${endDate}`);
  
  const { data: servizi, error } = await supabase
    .from('servizi')
    .select('incasso_ricevuto, incasso_previsto')
    .eq('assegnato_a', userId)
    .eq('metodo_pagamento', 'Contanti')
    .gte('data_servizio', startDate)
    .lte('data_servizio', endDate)
    .in('stato', ['completato', 'consuntivato']);

  if (error) {
    console.error('[getIncassiServiziContanti] Error:', error);
    throw error;
  }

  const totale = servizi?.reduce((sum, s) => 
    sum + Number(s.incasso_ricevuto || s.incasso_previsto || 0), 0
  ) || 0;

  console.log(`[getIncassiServiziContanti] Totale: €${totale}`);
  return totale;
}

/**
 * Recupera le detrazioni per il calcolo dello stipendio
 */
export async function getDetrazioniStipendio(
  userId: string, 
  mese: number, 
  anno: number
): Promise<DetrazioniStipendio> {
  
  // Calcolo date sicuro senza problemi timezone
  const startDate = `${anno}-${String(mese).padStart(2, '0')}-01`;
  const lastDay = new Date(anno, mese, 0).getDate();
  const endDate = `${anno}-${String(mese).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  // Recupera spese personali del mese
  const { data: spesePersonali, error: errorSpese } = await supabase
    .from('spese_dipendenti')
    .select('importo')
    .eq('user_id', userId)
    .eq('stato', 'approvata')
    .gte('data_spesa', startDate)
    .lte('data_spesa', endDate);
  
  if (errorSpese) {
    console.error('[getDetrazioniStipendio] Errore recupero spese:', errorSpese);
    throw errorSpese;
  }
  
  // Recupera prelievi del mese (movimenti aziendali di tipo prelievo)
  const { data: prelievi, error: errorPrelievi } = await supabase
    .from('spese_aziendali')
    .select('importo')
    .eq('socio_id', userId)
    .eq('tipologia', 'prelievo')
    .gte('data_movimento', startDate)
    .lte('data_movimento', endDate);
  
  if (errorPrelievi) {
    console.error('[getDetrazioniStipendio] Errore recupero prelievi:', errorPrelievi);
    throw errorPrelievi;
  }

  // NUOVO: Recupera versamenti del mese (movimenti aziendali di tipo versamento)
  const { data: versamenti, error: errorVersamenti } = await supabase
    .from('spese_aziendali')
    .select('importo')
    .eq('socio_id', userId)
    .eq('tipologia', 'versamento')
    .gte('data_movimento', startDate)
    .lte('data_movimento', endDate);
  
  if (errorVersamenti) {
    console.error('[getDetrazioniStipendio] Errore recupero versamenti:', errorVersamenti);
    throw errorVersamenti;
  }
  
  // Recupera spese aziendali anticipate dal socio di tasca (tipologia='spesa' + socio_id)
  const { data: speseAnticipate, error: errorSpeseAnticipate } = await supabase
    .from('spese_aziendali')
    .select('importo')
    .eq('socio_id', userId)
    .eq('tipologia', 'spesa')
    .gte('data_movimento', startDate)
    .lte('data_movimento', endDate);

  if (errorSpeseAnticipate) {
    console.error('[getDetrazioniStipendio] Errore recupero spese anticipate:', errorSpeseAnticipate);
    throw errorSpeseAnticipate;
  }

  const totaleSpeseAnticipate = speseAnticipate?.reduce(
    (sum, s) => sum + Number(s.importo), 0
  ) || 0;

  // Recupera incassi da dipendenti (contanti consegnati al socio da servizi di altri)
  const { data: serviziConContanti, error: errorIncassi } = await supabase
    .from('servizi')
    .select('incasso_ricevuto, incasso_previsto')
    .eq('consegna_contanti_a', userId)
    .eq('stato', 'consuntivato')
    .not('assegnato_a', 'eq', userId)  // Solo servizi di ALTRI dipendenti
    .gte('data_servizio', startDate)
    .lte('data_servizio', endDate);

  if (errorIncassi) {
    console.error('[getDetrazioniStipendio] Errore recupero incassi dipendenti:', errorIncassi);
    throw errorIncassi;
  }
  
  // Calcola totale incassi da dipendenti
  const incassiDaDipendenti = serviziConContanti?.reduce(
    (sum, s) => sum + Number(s.incasso_ricevuto || s.incasso_previsto || 0), 
    0
  ) || 0;
  
  // Calcola incassi da servizi contanti personali
  const incassiServiziContanti = await getIncassiServiziContanti(
    userId,
    startDate,
    endDate
  );
  
  // Recupera riporto dal mese precedente (stipendio del mese precedente)
  const mesePrecedente = mese === 1 ? 12 : mese - 1;
  const annoPrecedente = mese === 1 ? anno - 1 : anno;
  
  // Riporto include anche stipendi 'bozza' per continuità saldi (FIX BUG #3)
  const { data: stipendioPrecedente, error: errorRiporto } = await supabase
    .from('stipendi')
    .select('totale_netto, stato')
    .eq('user_id', userId)
    .eq('mese', mesePrecedente)
    .eq('anno', annoPrecedente)
    .in('stato', ['bozza', 'confermato', 'pagato'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (errorRiporto && errorRiporto.code !== 'PGRST116') {
    console.error('[getDetrazioniStipendio] Errore recupero riporto:', errorRiporto);
    throw errorRiporto;
  }
  
  const totaleSpesePersonali = spesePersonali?.reduce((sum, spesa) => sum + Number(spesa.importo), 0) || 0;
  const totalePrelievi = prelievi?.reduce((sum, prelievo) => sum + Number(prelievo.importo), 0) || 0;
  const totaleVersamenti = versamenti?.reduce((sum, versamento) => sum + Number(versamento.importo), 0) || 0;
  const riportoMesePrecedente = stipendioPrecedente?.totale_netto ? Number(stipendioPrecedente.totale_netto) : 0;
  
  const detrazioni: DetrazioniStipendio = {
    totaleSpesePersonali,
    totalePrelievi,
    totaleVersamenti,
    totaleSpeseAnticipate,
    incassiDaDipendenti,
    incassiServiziContanti,
    riportoMesePrecedente
  };
  
  return detrazioni;
}

/**
 * Calcola lo stipendio completo integrando database e logica di calcolo
 */
export async function calcolaStipendioCompleto(
  params: CalcoloStipendioParams
): Promise<CalcoloStipendioCompleto> {
  const { userId, mese, anno, km, oreAttesa } = params;
  
  console.log('[CALCOLO] 🚀 Inizio calcolo per:', params);
  
  try {
    // 1. Recupera configurazione stipendi per l'anno
    const { data: configurazione, error: errorConfig } = await supabase
      .from('configurazione_stipendi')
      .select('*')
      .eq('anno', anno)
      .single();
    
    if (errorConfig) {
      console.error('[CALCOLO] ❌ Errore recupero configurazione:', errorConfig);
      throw errorConfig;
    }
    
    if (!configurazione) {
      throw new Error(`Nessuna configurazione trovata per l'anno ${anno}`);
    }
    
    console.log('[CALCOLO] ⚙️ Configurazione:', {
      coefficiente: configurazione.coefficiente_aumento,
      percentualeAumento: `+${((configurazione.coefficiente_aumento - 1) * 100).toFixed(0)}%`,
      tariffaOraria: configurazione.tariffa_oraria_attesa
    });
    
    // 2. Calcola base KM usando la nuova logica
    const resultBaseKm = await calcolaBaseKm(km, anno);
    console.log('[CALCOLO] 📊 Modalità calcolo:', resultBaseKm.modalita);
    console.log('[CALCOLO] 🛣️ Dettaglio:', resultBaseKm.dettaglio);
    console.log('[CALCOLO] 💰 Base KM:', resultBaseKm.base);
    
    // 3. Applica coefficiente aumento
    const baseConAumento = Number((resultBaseKm.base * configurazione.coefficiente_aumento).toFixed(2));
    const aumentoApplicato = Number((baseConAumento - resultBaseKm.base).toFixed(2));
    console.log('[CALCOLO] 📈 Base con aumento:', baseConAumento, `(+${aumentoApplicato})`);
    
    // 4. Calcola ore attesa
    const importoOreAttesa = Number((oreAttesa * configurazione.tariffa_oraria_attesa).toFixed(2));
    console.log('[CALCOLO] ⏱️ Ore attesa:', `${oreAttesa}h × ${configurazione.tariffa_oraria_attesa}€ = ${importoOreAttesa}€`);
    
    // 5. Calcola totale lordo
    const totaleLordo = Number((baseConAumento + importoOreAttesa).toFixed(2));
    console.log('[CALCOLO] 💵 Totale lordo:', totaleLordo);
    
    // 6. Recupera detrazioni
    const detrazioni = await getDetrazioniStipendio(userId, mese, anno);
    console.log('[CALCOLO] 📋 Detrazioni:', detrazioni);
    
    // 7. Calcola totale netto
    // Formula: versamenti aumentano il netto (socio restituisce denaro all'azienda)
    const totaleNetto = Number((
      totaleLordo +                          // Base lordo (KM + ore attesa con aumento)
      detrazioni.totaleSpesePersonali +      // ✅ AGGIUNGI rimborsi spese
      detrazioni.totaleVersamenti +          // ✅ AGGIUNGI versamenti (riducono debito socio)
      detrazioni.totaleSpeseAnticipate -     // ✅ AGGIUNGI spese aziendali anticipate dal socio (rimborso)
      detrazioni.totalePrelievi -            // ✅ SOTTRAI prelievi
      detrazioni.incassiDaDipendenti -       // ✅ SOTTRAI incassi da dipendenti
      detrazioni.incassiServiziContanti +    // ✅ SOTTRAI incassi servizi contanti
      detrazioni.riportoMesePrecedente       // ✅ AGGIUNGI riporto mese precedente (credito/debito portato avanti)
    ).toFixed(2));

    console.log('[CALCOLO] 💳 Breakdown netto:', {
      totaleLordo,
      spesePersonali: `+${detrazioni.totaleSpesePersonali}`,
      versamenti: `+${detrazioni.totaleVersamenti}`,
      speseAnticipate: `+${detrazioni.totaleSpeseAnticipate}`,
      prelievi: `-${detrazioni.totalePrelievi}`,
      incassiDipendenti: `-${detrazioni.incassiDaDipendenti}`,
      incassiServizi: `-${detrazioni.incassiServiziContanti}`,
      riporto: `${detrazioni.riportoMesePrecedente >= 0 ? '+' : ''}${detrazioni.riportoMesePrecedente}`,
      risultato: totaleNetto
    });
    
    const risultatoCompleto: CalcoloStipendioCompleto = {
      baseKm: resultBaseKm.base,
      baseConAumento,
      importoOreAttesa,
      totaleLordo,
      detrazioni,
      totaleNetto,
      dettaglioCalcolo: {
        modalitaCalcolo: resultBaseKm.modalita,
        dettaglio: resultBaseKm.dettaglio,
        configurazione,
        parametriInput: {
          km,
          oreAttesa,
          coefficiente: configurazione.coefficiente_aumento,
          tariffaOraria: configurazione.tariffa_oraria_attesa
        }
      }
    };
    
    console.log('[CALCOLO] ✅ Completato:', { 
      totaleLordo, 
      totaleNetto,
      modalita: resultBaseKm.modalita 
    });
    return risultatoCompleto;
    
  } catch (error) {
    console.error('[CALCOLO] ❌ Errore:', error);
    throw error;
  }
}
