import { supabase } from '@/lib/supabase';
import { ReportSocioRow, ReportSocioStats } from '@/lib/types/report-soci';

export async function getReportSociData(
  mese: number,
  anno: number
): Promise<{ rows: ReportSocioRow[]; stats: ReportSocioStats }> {
  try {
    console.log('[getReportSociData] Fetching data for:', { mese, anno });

    // 1. Fetch tutti i soci (admin + socio)
    const { data: soci, error: sociError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .in('role', ['admin', 'socio']);

    if (sociError) throw sociError;
    if (!soci || soci.length === 0) {
      return { rows: [], stats: getEmptyStats() };
    }

    // 2. Calcola date range per il mese selezionato
    const dataInizio = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
    const dataFine = new Date(anno, mese, 0).toISOString().split('T')[0];

    // 3. Per ogni socio, calcola tutte le metriche
    const rows: ReportSocioRow[] = await Promise.all(
      soci.map(async (socio) => {
        // Fetch stipendio del mese corrente
        const { data: stipendioData } = await supabase
          .from('stipendi')
          .select('totale_lordo, riporto_mese_precedente')
          .eq('user_id', socio.id)
          .eq('mese', mese)
          .eq('anno', anno)
          .maybeSingle();

        const riporto = stipendioData?.riporto_mese_precedente || 0;
        const stipendio = stipendioData?.totale_lordo || 0;

        // Fetch prelievi del mese
        const { data: prelieviData } = await supabase
          .from('spese_aziendali')
          .select('importo')
          .eq('socio_id', socio.id)
          .eq('tipologia', 'prelievo')
          .gte('data_movimento', dataInizio)
          .lte('data_movimento', dataFine);

        const prelievi = prelieviData?.reduce((sum, p) => sum + (p.importo || 0), 0) || 0;

        // Fetch spese effettuate del mese
        const { data: speseData } = await supabase
          .from('spese_aziendali')
          .select('importo')
          .eq('socio_id', socio.id)
          .eq('tipologia', 'spesa')
          .gte('data_movimento', dataInizio)
          .lte('data_movimento', dataFine);

        const speseEffettuate = speseData?.reduce((sum, s) => sum + (s.importo || 0), 0) || 0;

        // Fetch incassi da dipendenti (contanti consegnati al socio da servizi di altri)
        const { data: incassiDipData } = await supabase
          .from('servizi')
          .select('incasso_ricevuto')
          .eq('consegna_contanti_a', socio.id)
          .eq('stato', 'consuntivato')
          .not('assegnato_a', 'eq', socio.id) // Solo servizi di ALTRI (dipendenti), non propri
          .gte('data_servizio', dataInizio)
          .lte('data_servizio', dataFine);

        const incassiDaDipendenti = incassiDipData?.reduce((sum, i) => sum + (i.incasso_ricevuto || 0), 0) || 0;

        // Fetch versamenti del mese
        const { data: versamentiData } = await supabase
          .from('spese_aziendali')
          .select('importo')
          .eq('socio_id', socio.id)
          .eq('tipologia', 'versamento')
          .gte('data_movimento', dataInizio)
          .lte('data_movimento', dataFine);

        const versamenti = versamentiData?.reduce((sum, v) => sum + (v.importo || 0), 0) || 0;

        // Fetch incassi personali da servizi in contanti del mese
        const { data: serviziContantiData } = await supabase
          .from('servizi')
          .select('incasso_ricevuto, incasso_previsto')
          .eq('assegnato_a', socio.id)
          .eq('metodo_pagamento', 'Contanti')
          .in('stato', ['completato', 'consuntivato'])
          .gte('data_servizio', dataInizio)
          .lte('data_servizio', dataFine);

        const incassiPersonali = serviziContantiData?.reduce(
          (sum, s) => sum + (s.incasso_ricevuto || s.incasso_previsto || 0),
          0
        ) || 0;

        // Calcola incrementale stipendi (da gennaio al mese corrente dell'anno solare)
        const { data: stipendiAnnoData } = await supabase
          .from('stipendi')
          .select('totale_lordo')
          .eq('user_id', socio.id)
          .eq('anno', anno)
          .gte('mese', 1)
          .lte('mese', mese);

        const incrementaleStipendi = stipendiAnnoData?.reduce(
          (sum, s) => sum + (s.totale_lordo || 0),
          0
        ) || 0;

        // Calcola totale del mese
        const totaleMese = riporto + stipendio - prelievi - speseEffettuate + incassiDaDipendenti + incassiPersonali + versamenti;

        return {
          userId: socio.id,
          firstName: socio.first_name || '',
          lastName: socio.last_name || '',
          fullName: `${socio.first_name || ''} ${socio.last_name || ''}`.trim(),
          riporto,
          stipendio,
          prelievi,
          speseEffettuate,
          incassiDaDipendenti,
          incassiPersonali,
          totaleMese,
          totalePercentuale: 0, // Calcolato dopo
          incrementaleStipendi,
        };
      })
    );

    // 4. Calcola totale percentuale per ogni socio
    const sommaStipendi_TUTTI = rows.reduce((sum, r) => sum + r.incrementaleStipendi, 0);
    
    rows.forEach((row) => {
      row.totalePercentuale = sommaStipendi_TUTTI > 0 
        ? (row.incrementaleStipendi / sommaStipendi_TUTTI) * 100 
        : 0;
    });

    // 5. Calcola statistiche aggregate
    const stats: ReportSocioStats = {
      totaleStipendi: rows.reduce((sum, r) => sum + r.stipendio, 0),
      totalePrelievi: rows.reduce((sum, r) => sum + r.prelievi, 0),
      totaleSpese: rows.reduce((sum, r) => sum + r.speseEffettuate, 0),
      totaleIncassi: rows.reduce((sum, r) => sum + r.incassiDaDipendenti + r.incassiPersonali, 0),
      numeroSoci: rows.length,
      mediaStipendio: rows.length > 0 
        ? rows.reduce((sum, r) => sum + r.stipendio, 0) / rows.length 
        : 0,
    };

    console.log('[getReportSociData] Success:', { rowsCount: rows.length, stats });
    return { rows, stats };
  } catch (error) {
    console.error('[getReportSociData] Error:', error);
    throw error;
  }
}

function getEmptyStats(): ReportSocioStats {
  return {
    totaleStipendi: 0,
    totalePrelievi: 0,
    totaleSpese: 0,
    totaleIncassi: 0,
    numeroSoci: 0,
    mediaStipendio: 0,
  };
}
