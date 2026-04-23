import { supabase } from '@/lib/supabase';
import { calcolaStipendioCompleto } from './calcolaStipendio';
import { fetchConfigurazioneStipendi } from './configurazione';

/**
 * Ricalcola e salva lo stipendio di un singolo (socio, mese, anno).
 * UPSERT su public.stipendi. Single source of truth per il calcolo persistito.
 * Restituisce il totale_netto salvato.
 */
export async function ricalcolaStipendioMese(
  userId: string,
  mese: number,
  anno: number
): Promise<number> {
  const startDate = `${anno}-${String(mese).padStart(2, '0')}-01`;
  const lastDay = new Date(anno, mese, 0).getDate();
  const endDate = `${anno}-${String(mese).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  // Fetch servizi del mese
  const { data: servizi, error: serviziError } = await supabase
    .from('servizi')
    .select('km_totali, ore_sosta, ore_attesa_socio')
    .eq('assegnato_a', userId)
    .in('stato', ['completato', 'consuntivato'])
    .gte('data_servizio', startDate)
    .lte('data_servizio', endDate);

  if (serviziError) {
    console.error('[ricalcolaStipendioMese] Errore fetch servizi:', serviziError);
    throw serviziError;
  }

  let kmTotali = 0;
  let oreAttesaTotali = 0;
  for (const s of servizi || []) {
    kmTotali += Number(s.km_totali) || 0;
    oreAttesaTotali += Number(s.ore_sosta) || 0;
  }

  // Verifica esistenza e stato stipendio
  const { data: existing } = await supabase
    .from('stipendi')
    .select('id, stato')
    .eq('user_id', userId)
    .eq('mese', mese)
    .eq('anno', anno)
    .maybeSingle();

  // Se confermato/pagato, non sovrascrivere
  if (existing && existing.stato !== 'bozza') {
    console.log(`[ricalcolaStipendioMese] Skip ${userId} ${mese}/${anno}: stato=${existing.stato}`);
    // Ritorna il netto attuale per propagare riporto
    const { data: stip } = await supabase
      .from('stipendi')
      .select('totale_netto')
      .eq('id', existing.id)
      .maybeSingle();
    return Number(stip?.totale_netto) || 0;
  }

  // Calcolo completo (Batch 1 formula)
  const risultato = await calcolaStipendioCompleto({
    userId,
    mese,
    anno,
    km: kmTotali,
    oreAttesa: oreAttesaTotali,
  });

  const config = await fetchConfigurazioneStipendi(anno);

  const payload = {
    totale_km: kmTotali,
    totale_ore_attesa: oreAttesaTotali,
    base_calcolo: risultato.baseKm,
    coefficiente_applicato: config?.coefficiente_aumento || risultato.dettaglioCalcolo.parametriInput.coefficiente,
    totale_lordo: risultato.totaleLordo,
    totale_spese: risultato.detrazioni.totaleSpeseSocio,
    totale_prelievi: risultato.detrazioni.totalePrelievi,
    incassi_da_dipendenti: risultato.detrazioni.incassiDaDipendenti + risultato.detrazioni.incassiPersonali,
    riporto_mese_precedente: risultato.detrazioni.riportoMesePrecedente,
    totale_netto: risultato.totaleNetto,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error: updateError } = await supabase
      .from('stipendi')
      .update(payload)
      .eq('id', existing.id);
    if (updateError) {
      console.error('[ricalcolaStipendioMese] Errore update:', updateError);
      throw updateError;
    }
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Utente non autenticato');
    const { error: insertError } = await supabase
      .from('stipendi')
      .insert({
        ...payload,
        user_id: userId,
        mese,
        anno,
        tipo_calcolo: 'socio',
        stato: 'bozza',
        created_by: user.id,
      });
    if (insertError) {
      console.error('[ricalcolaStipendioMese] Errore insert:', insertError);
      throw insertError;
    }
  }

  return risultato.totaleNetto;
}

/**
 * Ricalcola il mese indicato E tutti i mesi successivi dell'anno solare,
 * fino a MIN(mese corrente reale, dicembre). Propaga il riporto a cascata.
 */
export async function ricalcolaStipendioConCascata(
  userId: string,
  meseInizio: number,
  anno: number
): Promise<void> {
  const oggi = new Date();
  const meseCorrente = oggi.getFullYear() === anno ? oggi.getMonth() + 1 : 12;
  const meseFine = oggi.getFullYear() < anno ? 0 : Math.min(12, meseCorrente);

  if (meseFine < meseInizio) {
    console.log(`[cascata] Nessun mese da ricalcolare per ${userId} (${meseInizio}/${anno})`);
    return;
  }

  for (let m = meseInizio; m <= meseFine; m++) {
    try {
      await ricalcolaStipendioMese(userId, m, anno);
    } catch (err) {
      console.error(`[cascata] Errore ricalcolo ${userId} ${m}/${anno}:`, err);
    }
  }

  console.log(`[cascata] Ricalcolati stipendi ${userId} da ${meseInizio}/${anno} a ${meseFine}/${anno}`);
}

export interface RicalcolaStipendioResult {
  success: boolean;
  stipendioId?: string;
  totaleNetto?: number;
  error?: string;
}

/**
 * Ricalcola e salva uno stipendio nel database
 * Può essere usato sia per stipendi esistenti che per crearne di nuovi
 */
export async function ricalcolaESalvaStipendio(
  userId: string,
  mese: number,
  anno: number
): Promise<RicalcolaStipendioResult> {
  try {
    // 1. Verifica se esiste già uno stipendio per questo mese
    const { data: existingStipendio, error: fetchError } = await supabase
      .from('stipendi')
      .select('id, stato')
      .eq('user_id', userId)
      .eq('mese', mese)
      .eq('anno', anno)
      .maybeSingle();

    if (fetchError) {
      console.error('[ricalcolaESalvaStipendio] Errore fetch stipendio:', fetchError);
      throw fetchError;
    }

    // Se lo stipendio è già confermato o pagato, non ricalcolare
    if (existingStipendio && existingStipendio.stato !== 'bozza') {
      return {
        success: false,
        error: 'Non è possibile ricalcolare uno stipendio già confermato o pagato',
      };
    }

    // 2. Recupera i servizi del mese per questo utente
    const startDate = `${anno}-${String(mese).padStart(2, '0')}-01`;
    const lastDay = new Date(anno, mese, 0).getDate();
    const endDate = `${anno}-${String(mese).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data: servizi, error: serviziError } = await supabase
      .from('servizi')
      .select('id, km_totali, ore_sosta, data_servizio, id_progressivo, metodo_pagamento, incasso_ricevuto, incasso_previsto')
      .eq('assegnato_a', userId)
      .in('stato', ['completato', 'consuntivato'])
      .gte('data_servizio', startDate)
      .lte('data_servizio', endDate);

    if (serviziError) {
      console.error('[ricalcolaESalvaStipendio] Errore fetch servizi:', serviziError);
      throw serviziError;
    }

    const serviziList = servizi || [];
    const kmTotali = serviziList.reduce((sum, s) => sum + (Number(s.km_totali) || 0), 0);
    const oreAttesa = serviziList.reduce((sum, s) => sum + (Number(s.ore_sosta) || 0), 0);

    // Calcola contanti dai servizi
    const contantiServizi = serviziList
      .filter(s => s.metodo_pagamento === 'Contanti')
      .reduce((sum, s) => sum + (Number(s.incasso_ricevuto) || Number(s.incasso_previsto) || 0), 0);

    // 3. Esegui il calcolo completo
    const calcoloCompleto = await calcolaStipendioCompleto({
      userId,
      mese,
      anno,
      km: kmTotali,
      oreAttesa,
    });

    // 4. Prepara i dati da salvare
    const stipendioData = {
      totale_km: kmTotali,
      totale_ore_attesa: oreAttesa,
      base_calcolo: calcoloCompleto.baseKm,
      coefficiente_applicato: calcoloCompleto.dettaglioCalcolo.parametriInput.coefficiente,
      totale_lordo: calcoloCompleto.totaleLordo,
      totale_spese: calcoloCompleto.detrazioni.totaleSpesePersonali,
      totale_prelievi: calcoloCompleto.detrazioni.totalePrelievi,
      incassi_da_dipendenti: calcoloCompleto.detrazioni.incassiDaDipendenti + contantiServizi,
      riporto_mese_precedente: calcoloCompleto.detrazioni.riportoMesePrecedente,
      totale_netto: calcoloCompleto.totaleNetto,
      updated_at: new Date().toISOString(),
    };

    // 5. Salva o aggiorna
    if (existingStipendio) {
      // Aggiorna stipendio esistente
      const { error: updateError } = await supabase
        .from('stipendi')
        .update(stipendioData)
        .eq('id', existingStipendio.id);

      if (updateError) {
        console.error('[ricalcolaESalvaStipendio] Errore update:', updateError);
        throw updateError;
      }

      return {
        success: true,
        stipendioId: existingStipendio.id,
        totaleNetto: calcoloCompleto.totaleNetto,
      };
    } else {
      // Crea nuovo stipendio
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Utente non autenticato' };
      }

      const { data: newStipendio, error: insertError } = await supabase
        .from('stipendi')
        .insert({
          ...stipendioData,
          user_id: userId,
          mese,
          anno,
          tipo_calcolo: 'socio',
          stato: 'bozza',
          created_by: user.id,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('[ricalcolaESalvaStipendio] Errore insert:', insertError);
        throw insertError;
      }

      return {
        success: true,
        stipendioId: newStipendio.id,
        totaleNetto: calcoloCompleto.totaleNetto,
      };
    }
  } catch (error) {
    console.error('[ricalcolaESalvaStipendio] Errore:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto',
    };
  }
}

/**
 * Ricalcola tutti gli stipendi dei soci per un mese specifico
 */
export async function ricalcolaTuttiStipendiMese(
  mese: number,
  anno: number
): Promise<{ success: number; errors: number; details: string[] }> {
  // Recupera tutti i soci e admin
  const { data: soci, error: sociError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('role', ['admin', 'socio']);

  if (sociError || !soci) {
    console.error('[ricalcolaTuttiStipendiMese] Errore fetch soci:', sociError);
    return { success: 0, errors: 1, details: ['Errore nel recupero degli utenti'] };
  }

  let successCount = 0;
  let errorCount = 0;
  const details: string[] = [];

  for (const socio of soci) {
    const result = await ricalcolaESalvaStipendio(socio.id, mese, anno);
    
    if (result.success) {
      successCount++;
      details.push(`✓ ${socio.first_name} ${socio.last_name}: €${result.totaleNetto?.toFixed(2)}`);
    } else {
      errorCount++;
      details.push(`✗ ${socio.first_name} ${socio.last_name}: ${result.error}`);
    }
  }

  return { success: successCount, errors: errorCount, details };
}
