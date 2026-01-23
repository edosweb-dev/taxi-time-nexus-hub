import { supabase } from '@/lib/supabase';
import { calcolaStipendioCompleto } from './calcolaStipendio';
import { fetchConfigurazioneStipendi } from './configurazione';

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
