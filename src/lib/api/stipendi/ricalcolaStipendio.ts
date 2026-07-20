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
    .select('km_totali, ore_attesa_socio')
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
    oreAttesaTotali += Number(s.ore_attesa_socio) || 0;
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
 * Ricalcola il mese indicato E tutti i mesi successivi fino al mese/anno corrente reale,
 * attraversando il confine anno se necessario. Propaga il riporto a cascata.
 *
 * Bug fix cross-year: prima il loop si fermava a dicembre dello stesso anno, lasciando
 * il riporto di gennaio stale (es. dicembre 2025 → gennaio 2026). Ora la cascata
 * continua attraverso anni multipli fino al mese corrente.
 */
export async function ricalcolaStipendioConCascata(
  userId: string,
  meseInizio: number,
  anno: number
): Promise<void> {
  const oggi = new Date();
  const annoCorrente = oggi.getFullYear();
  const meseCorrente = oggi.getMonth() + 1;

  // Salta se punto di partenza è nel futuro
  if (anno > annoCorrente || (anno === annoCorrente && meseInizio > meseCorrente)) {
    console.log(`[cascata] Nessun mese da ricalcolare per ${userId} (${meseInizio}/${anno} oltre mese corrente ${meseCorrente}/${annoCorrente})`);
    return;
  }

  let m = meseInizio;
  let a = anno;

  while (a < annoCorrente || (a === annoCorrente && m <= meseCorrente)) {
    try {
      await ricalcolaStipendioMese(userId, m, a);
    } catch (err) {
      console.error(`[cascata] Errore ricalcolo ${userId} ${m}/${a}:`, err);
    }
    m++;
    if (m > 12) {
      m = 1;
      a++;
    }
  }

  console.log(`[cascata] Ricalcolati stipendi ${userId} da ${meseInizio}/${anno} fino a ${meseCorrente}/${annoCorrente}`);
}

export interface RicalcolaCascataDettaglio {
  userId: string;
  ok: boolean;
  error?: string;
}

export interface RicalcolaTuttiCascataResult {
  successi: number;
  errori: number;
  dettagli: RicalcolaCascataDettaglio[];
}

/**
 * Ricalcola tutti i soci/admin con propagazione a cascata sui mesi successivi.
 * I soci sono processati in parallelo (Promise.allSettled), ma all'interno di
 * ogni socio i mesi restano sequenziali (dentro ricalcolaStipendioConCascata).
 */
export async function ricalcolaTuttiStipendiCascata(
  meseInizio: number,
  anno: number
): Promise<RicalcolaTuttiCascataResult> {
  const { data: soci, error: sociError } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'socio']);

  if (sociError || !soci) {
    console.error('[ricalcolaTuttiStipendiCascata] Errore fetch soci:', sociError);
    return {
      successi: 0,
      errori: 1,
      dettagli: [{ userId: '', ok: false, error: 'Errore nel recupero degli utenti' }],
    };
  }

  const results = await Promise.allSettled(
    soci.map(async (s) => {
      await ricalcolaStipendioConCascata(s.id, meseInizio, anno);
      return s.id;
    })
  );

  const dettagli: RicalcolaCascataDettaglio[] = results.map((r, idx) => {
    if (r.status === 'fulfilled') {
      return { userId: soci[idx].id, ok: true };
    }
    return {
      userId: soci[idx].id,
      ok: false,
      error: r.reason instanceof Error ? r.reason.message : String(r.reason),
    };
  });

  return {
    successi: dettagli.filter((d) => d.ok).length,
    errori: dettagli.filter((d) => !d.ok).length,
    dettagli,
  };
}

/**
 * Ricalcola lo stipendio del mese a cui appartiene un servizio appena
 * completato o consuntivato.
 *
 * Serve perche' km_totali e ore_attesa_socio concorrono allo stipendio del
 * socio assegnato, ma finora nessun percorso ricalcolava il record in
 * `stipendi` quando un servizio cambiava stato: il ricalcolo era invocato solo
 * dalle spese aziendali, dalla pagina Stipendi e dal dettaglio. Il risultato,
 * verificato in produzione: per febbraio 2026 Andrea Di Gregorio aveva 170 ore
 * di attesa registrate sui servizi e `stipendi.totale_lordo` fermo a 0, quindi
 * il report soci mostrava zero invece di 3.060 euro (170 x 18).
 *
 * Il report legge il valore memorizzato dal commit 284893ff del 21/04/2026
 * (FB-09), scelta corretta per allineare le colonne "stipendio" e
 * "incrementale" ma valida solo se quel valore e' aggiornato. Questa funzione
 * rimuove l'assunto sbagliato invece di tornare al calcolo live.
 *
 * Non lancia mai: un errore nel ricalcolo non deve far fallire il
 * completamento o la consuntivazione del servizio. Il ricalcolo e' idempotente
 * e resta disponibile a mano dalla pagina Stipendi come rete di sicurezza.
 * ricalcolaStipendioMese salta da solo i mesi gia' confermati o pagati.
 */
export async function ricalcolaStipendioPerServizio(
  servizio: { assegnato_a?: string | null; data_servizio?: string | null } | null | undefined
): Promise<void> {
  try {
    if (!servizio?.assegnato_a || !servizio?.data_servizio) return;

    const data = new Date(servizio.data_servizio);
    if (Number.isNaN(data.getTime())) return;

    await ricalcolaStipendioConCascata(
      servizio.assegnato_a,
      data.getMonth() + 1,
      data.getFullYear()
    );
  } catch (err) {
    console.error('[ricalcolaStipendioPerServizio] Ricalcolo fallito:', err);
  }
}
