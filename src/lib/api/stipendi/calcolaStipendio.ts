
import { supabase } from '@/lib/supabase';
import { TariffaKm, ConfigurazioneStipendi } from './types';
import { calcolaStipendioSocio, CalcoloSocioParams, CalcoloSocioResult } from '@/lib/calcoloStipendi';

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
  totalePrelievi: number;
  incassiDaDipendenti: number;
  riportoMesePrecedente: number;
}

export interface CalcoloStipendioCompleto extends CalcoloSocioResult {
  detrazioni: DetrazioniStipendio;
  totaleNetto: number;
  dettaglioCalcolo: {
    tariffe: TariffaKm[];
    configurazione: ConfigurazioneStipendi;
    parametriUsati: CalcoloSocioParams;
  };
}

/**
 * Recupera le detrazioni per il calcolo dello stipendio
 */
export async function getDetrazioniStipendio(
  userId: string, 
  mese: number, 
  anno: number
): Promise<DetrazioniStipendio> {
  console.log(`[getDetrazioniStipendio] Recuperando detrazioni per user ${userId}, ${mese}/${anno}`);
  
  const startDate = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(anno, mese, 0).toISOString().split('T')[0];
  
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
  
  // Recupera incassi da dipendenti (movimenti aziendali di tipo incasso per il socio)
  const { data: incassi, error: errorIncassi } = await supabase
    .from('spese_aziendali')
    .select('importo')
    .eq('socio_id', userId)
    .eq('tipologia', 'incasso')
    .gte('data_movimento', startDate)
    .lte('data_movimento', endDate);
  
  if (errorIncassi) {
    console.error('[getDetrazioniStipendio] Errore recupero incassi:', errorIncassi);
    throw errorIncassi;
  }
  
  // Recupera riporto dal mese precedente (stipendio del mese precedente)
  const mesePrecedente = mese === 1 ? 12 : mese - 1;
  const annoPrecedente = mese === 1 ? anno - 1 : anno;
  
  const { data: stipendioPrecedente, error: errorRiporto } = await supabase
    .from('stipendi')
    .select('totale_netto')
    .eq('user_id', userId)
    .eq('mese', mesePrecedente)
    .eq('anno', annoPrecedente)
    .eq('stato', 'confermato')
    .single();
  
  if (errorRiporto && errorRiporto.code !== 'PGRST116') {
    console.error('[getDetrazioniStipendio] Errore recupero riporto:', errorRiporto);
    throw errorRiporto;
  }
  
  const totaleSpesePersonali = spesePersonali?.reduce((sum, spesa) => sum + Number(spesa.importo), 0) || 0;
  const totalePrelievi = prelievi?.reduce((sum, prelievo) => sum + Number(prelievo.importo), 0) || 0;
  const incassiDaDipendenti = incassi?.reduce((sum, incasso) => sum + Number(incasso.importo), 0) || 0;
  const riportoMesePrecedente = stipendioPrecedente?.totale_netto ? Number(stipendioPrecedente.totale_netto) : 0;
  
  const detrazioni: DetrazioniStipendio = {
    totaleSpesePersonali,
    totalePrelievi,
    incassiDaDipendenti,
    riportoMesePrecedente
  };
  
  console.log('[getDetrazioniStipendio] Detrazioni calcolate:', detrazioni);
  return detrazioni;
}

/**
 * Calcola lo stipendio completo integrando database e logica di calcolo
 */
export async function calcolaStipendioCompleto(
  params: CalcoloStipendioParams
): Promise<CalcoloStipendioCompleto> {
  const { userId, mese, anno, km, oreAttesa } = params;
  
  console.log('[calcolaStipendioCompleto] Inizio calcolo per:', params);
  
  try {
    // 1. Recupera tariffe km per l'anno
    const { data: tariffe, error: errorTariffe } = await supabase
      .from('tariffe_km')
      .select('*')
      .eq('anno', anno)
      .order('km', { ascending: true });
    
    if (errorTariffe) {
      console.error('[calcolaStipendioCompleto] Errore recupero tariffe:', errorTariffe);
      throw errorTariffe;
    }
    
    if (!tariffe || tariffe.length === 0) {
      throw new Error(`Nessuna tariffa trovata per l'anno ${anno}`);
    }
    
    // 2. Recupera configurazione stipendi per l'anno
    const { data: configurazione, error: errorConfig } = await supabase
      .from('configurazione_stipendi')
      .select('*')
      .eq('anno', anno)
      .single();
    
    if (errorConfig) {
      console.error('[calcolaStipendioCompleto] Errore recupero configurazione:', errorConfig);
      throw errorConfig;
    }
    
    if (!configurazione) {
      throw new Error(`Nessuna configurazione trovata per l'anno ${anno}`);
    }
    
    // 3. Prepara parametri per il calcolo
    const parametriCalcolo: CalcoloSocioParams = {
      km,
      oreAttesa,
      coefficienteAumento: Number(configurazione.coefficiente_aumento),
      tariffaOrariaAttesa: Number(configurazione.tariffa_oraria_attesa)
    };
    
    // 4. Esegui calcolo base
    const calcoloBase = calcolaStipendioSocio(parametriCalcolo);
    
    // 5. Recupera detrazioni
    const detrazioni = await getDetrazioniStipendio(userId, mese, anno);
    
    // 6. Calcola totale netto
    // Formula: Lordo - Spese - Prelievi + Incassi + Riporto
    const totaleNetto = Number((
      calcoloBase.totaleLordo - 
      detrazioni.totaleSpesePersonali - 
      detrazioni.totalePrelievi + 
      detrazioni.incassiDaDipendenti + 
      detrazioni.riportoMesePrecedente
    ).toFixed(2));
    
    const risultatoCompleto: CalcoloStipendioCompleto = {
      ...calcoloBase,
      detrazioni,
      totaleNetto,
      dettaglioCalcolo: {
        tariffe,
        configurazione,
        parametriUsati: parametriCalcolo
      }
    };
    
    console.log('[calcolaStipendioCompleto] Calcolo completato:', risultatoCompleto);
    return risultatoCompleto;
    
  } catch (error) {
    console.error('[calcolaStipendioCompleto] Errore durante il calcolo:', error);
    throw error;
  }
}
