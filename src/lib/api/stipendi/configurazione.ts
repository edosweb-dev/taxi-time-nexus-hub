import { supabase } from '@/lib/supabase';
import { TariffaKmFissa, ConfigurazioneStipendi, SimulatoreResult } from '@/lib/types/stipendi';

/**
 * Fetch tariffe KM fisse per un dato anno
 */
export async function fetchTariffeKm(anno: number): Promise<TariffaKmFissa[]> {
  const { data, error } = await supabase
    .from('tariffe_km_fissi')
    .select('*')
    .eq('anno', anno)
    .eq('attivo', true)
    .order('km', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Aggiorna singola tariffa KM
 */
export async function updateTariffa(id: string, importo: number): Promise<void> {
  const { error } = await supabase
    .from('tariffe_km_fissi')
    .update({ importo_base: importo })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Crea nuova tariffa KM
 */
export async function createTariffa(data: { anno: number; km: number; importo_base: number }): Promise<void> {
  const { error } = await supabase
    .from('tariffe_km_fissi')
    .insert({
      anno: data.anno,
      km: data.km,
      importo_base: data.importo_base,
      attivo: true
    });

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Esiste già una tariffa per ${data.km}km nell'anno ${data.anno}`);
    }
    throw error;
  }
}

/**
 * Elimina tariffa KM
 */
export async function deleteTariffa(id: string): Promise<void> {
  const { error } = await supabase
    .from('tariffe_km_fissi')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Fetch configurazione stipendi per anno
 */
export async function fetchConfigurazioneStipendi(anno: number): Promise<ConfigurazioneStipendi | null> {
  const { data, error } = await supabase
    .from('configurazione_stipendi')
    .select('*')
    .eq('anno', anno)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Aggiorna configurazione stipendi
 */
export async function updateConfigurazioneStipendi(
  anno: number,
  config: Partial<ConfigurazioneStipendi>
): Promise<void> {
  const { error } = await supabase
    .from('configurazione_stipendi')
    .update(config)
    .eq('anno', anno);

  if (error) throw error;
}

/**
 * Copia tariffe da anno precedente
 */
export async function generateFromPreviousYear(annoDestinazione: number): Promise<void> {
  const annoOrigine = annoDestinazione - 1;
  
  // Fetch tariffe anno precedente
  const tariffe = await fetchTariffeKm(annoOrigine);
  if (!tariffe.length) {
    throw new Error(`Nessuna tariffa trovata per l'anno ${annoOrigine}`);
  }

  // Copia con nuovo anno
  const nuoveTariffe = tariffe.map(t => ({
    anno: annoDestinazione,
    km: t.km,
    importo_base: t.importo_base,
    attivo: true
  }));

  const { error } = await supabase
    .from('tariffe_km_fissi')
    .upsert(nuoveTariffe, { onConflict: 'anno,km' });

  if (error) throw error;

  // Copia anche configurazione
  const config = await fetchConfigurazioneStipendi(annoOrigine);
  if (config) {
    const { error: configError } = await supabase
      .from('configurazione_stipendi')
      .upsert({
        anno: annoDestinazione,
        coefficiente_aumento: config.coefficiente_aumento,
        tariffa_oraria_attesa: config.tariffa_oraria_attesa,
        tariffa_oltre_200km: config.tariffa_oltre_200km || 0.25
      }, { onConflict: 'anno' });

    if (configError) throw configError;
  }
}

/**
 * Calcola base KM con logica doppia (≤200km: tabella, >200km: lineare)
 */
export async function calcolaBaseKm(
  kmTotali: number,
  anno: number
): Promise<{ base: number; dettaglio: string; modalita: 'tabella' | 'lineare' }> {
  if (kmTotali <= 200) {
    // Arrotonda a multiplo di 5 (eccetto 12km)
    let kmArrotondati = kmTotali;
    if (kmTotali > 12) {
      kmArrotondati = Math.round(kmTotali / 5) * 5;
    }

    // Fetch tariffa esatta
    const { data, error } = await supabase
      .from('tariffe_km_fissi')
      .select('importo_base')
      .eq('anno', anno)
      .eq('km', kmArrotondati)
      .eq('attivo', true)
      .maybeSingle();

    if (error || !data) {
      throw new Error(`Tariffa non trovata per ${kmArrotondati}km nell'anno ${anno}`);
    }

    return {
      base: data.importo_base,
      dettaglio: `KM ${kmTotali} → arrotondati a ${kmArrotondati}km → €${data.importo_base}`,
      modalita: 'tabella'
    };
  } else {
    // Calcolo lineare per km > 200
    const config = await fetchConfigurazioneStipendi(anno);
    if (!config || !config.tariffa_oltre_200km) {
      throw new Error(`Tariffa oltre 200km non configurata per l'anno ${anno}`);
    }

    const base = kmTotali * config.tariffa_oltre_200km;
    return {
      base: Number(base.toFixed(2)),
      dettaglio: `${kmTotali}km × €${config.tariffa_oltre_200km}/km = €${base.toFixed(2)}`,
      modalita: 'lineare'
    };
  }
}

/**
 * Simula calcolo stipendio completo
 */
export async function simulaCalcoloStipendio(params: {
  kmTotali: number;
  oreAttesa: number;
  anno: number;
}): Promise<SimulatoreResult> {
  const { kmTotali, oreAttesa, anno } = params;

  // Fetch configurazione
  const config = await fetchConfigurazioneStipendi(anno);
  if (!config) {
    throw new Error(`Configurazione non trovata per l'anno ${anno}`);
  }

  // Calcola base KM
  const { base: baseKm, dettaglio, modalita } = await calcolaBaseKm(kmTotali, anno);

  // Applica coefficiente aumento
  const baseConAumento = baseKm * config.coefficiente_aumento;

  // Calcola ore attesa
  const importoOreAttesa = oreAttesa * config.tariffa_oraria_attesa;

  // Totale lordo
  const totaleLordo = baseConAumento + importoOreAttesa;

  // Percentuale aumento
  const percentualeAumento = ((config.coefficiente_aumento - 1) * 100).toFixed(0);

  return {
    baseKm: Number(baseKm.toFixed(2)),
    baseConAumento: Number(baseConAumento.toFixed(2)),
    importoOreAttesa: Number(importoOreAttesa.toFixed(2)),
    totaleLordo: Number(totaleLordo.toFixed(2)),
    coefficiente: config.coefficiente_aumento,
    percentualeAumento: `+${percentualeAumento}%`,
    tariffaOraria: config.tariffa_oraria_attesa,
    modalitaCalcolo: modalita,
    dettaglioCalcolo: dettaglio
  };
}

/**
 * Download template CSV per tariffe
 */
export function downloadTemplateCsv(): void {
  const csvContent = `km,importo_base
12,15.00
15,18.00
20,20.00
25,22.50
30,25.00`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'template_tariffe_km.csv';
  link.click();
}

/**
 * Upload tariffe da CSV
 */
export async function uploadTariffeCsv(file: File, anno: number): Promise<void> {
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  
  // Skip header
  const dataLines = lines.slice(1);
  
  const tariffe: Array<{ anno: number; km: number; importo_base: number; attivo: boolean }> = [];
  
  for (const line of dataLines) {
    const [kmStr, importoStr] = line.split(',');
    const km = parseInt(kmStr?.trim() || '0');
    const importo = parseFloat(importoStr?.trim() || '0');

    // Validazioni
    if (isNaN(km) || km < 12 || km > 200) {
      throw new Error(`KM non valido: ${kmStr} (deve essere tra 12 e 200)`);
    }
    if (isNaN(importo) || importo <= 0) {
      throw new Error(`Importo non valido: ${importoStr}`);
    }

    tariffe.push({ anno, km, importo_base: importo, attivo: true });
  }

  if (!tariffe.length) {
    throw new Error('Nessuna tariffa valida trovata nel file');
  }

  const { error } = await supabase
    .from('tariffe_km_fissi')
    .upsert(tariffe, { onConflict: 'anno,km' });

  if (error) throw error;
}
