import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface DashboardMetrics {
  // Sezione 1 - Da gestire ora
  richiesteClientiCount: number;
  richiestaPiuVecchiaMinuti: number | null;
  daAssegnareCount: number;
  serviziOggiTotali: number;
  serviziOggiAssegnati: number;
  serviziOggiCompletati: number;

  // Sezione 2 - Performance mese
  ricaviMese: number;
  ricaviMeseScorso: number;
  serviziCompletatiMese: number;
  scostamentoIncassoMese: number; // sum(incasso_ricevuto - incasso_previsto) servizi consuntivati mese

  // Sezione 3 - Team & Fleet
  teamTotale: number;
  teamIndisponibiliOggi: number;
  veicoliAttivi: number;
}

interface RecentActivity {
  id: string;
  timestamp: string; // ISO completo
  event: string;
  user: string;
  type: 'servizio' | 'turno' | 'feedback';
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const oggi = new Date();
  const oggiStr = format(oggi, 'yyyy-MM-dd');
  const inizioMese = format(startOfMonth(oggi), 'yyyy-MM-dd');
  const fineMese = format(endOfMonth(oggi), 'yyyy-MM-dd');
  const inizioMeseScorso = format(startOfMonth(subMonths(oggi, 1)), 'yyyy-MM-dd');
  const fineMeseScorso = format(endOfMonth(subMonths(oggi, 1)), 'yyyy-MM-dd');

  // Richieste clienti da confermare (tutte quelle in stato richiesta_cliente)
  const { count: richiesteClientiCount } = await supabase
    .from('servizi')
    .select('*', { count: 'exact', head: true })
    .eq('stato', 'richiesta_cliente');

  // Richiesta più vecchia (per calcolare attesa)
  const { data: richiestaVecchia } = await supabase
    .from('servizi')
    .select('created_at')
    .eq('stato', 'richiesta_cliente')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  const richiestaPiuVecchiaMinuti = richiestaVecchia?.created_at
    ? Math.floor((Date.now() - new Date(richiestaVecchia.created_at).getTime()) / 60000)
    : null;

  // Da assegnare
  const { count: daAssegnareCount } = await supabase
    .from('servizi')
    .select('*', { count: 'exact', head: true })
    .eq('stato', 'da_assegnare');

  // Servizi oggi breakdown (tutti gli stati operativi, escluse bozze/annullati)
  const { data: serviziOggi } = await supabase
    .from('servizi')
    .select('stato')
    .eq('data_servizio', oggiStr)
    .in('stato', ['richiesta_cliente','da_assegnare','assegnato','completato','consuntivato']);
  const serviziOggiTotali = serviziOggi?.length || 0;
  const serviziOggiAssegnati = serviziOggi?.filter(s => s.stato === 'assegnato').length || 0;
  const serviziOggiCompletati = serviziOggi?.filter(s => ['completato','consuntivato'].includes(s.stato)).length || 0;

  // Ricavi mese
  const { data: serviziMese } = await supabase
    .from('servizi')
    .select('incasso_ricevuto, incasso_previsto')
    .gte('data_servizio', inizioMese)
    .lte('data_servizio', fineMese)
    .in('stato', ['completato','consuntivato']);
  const ricaviMese = serviziMese?.reduce((s, x) => s + (x.incasso_ricevuto ?? x.incasso_previsto ?? 0), 0) || 0;

  const { data: serviziMeseScorso } = await supabase
    .from('servizi')
    .select('incasso_ricevuto, incasso_previsto')
    .gte('data_servizio', inizioMeseScorso)
    .lte('data_servizio', fineMeseScorso)
    .in('stato', ['completato','consuntivato']);
  const ricaviMeseScorso = serviziMeseScorso?.reduce((s, x) => s + (x.incasso_ricevuto ?? x.incasso_previsto ?? 0), 0) || 0;

  // Servizi completati mese
  const { count: serviziCompletatiMese } = await supabase
    .from('servizi')
    .select('*', { count: 'exact', head: true })
    .gte('data_servizio', inizioMese)
    .lte('data_servizio', fineMese)
    .in('stato', ['completato','consuntivato']);

  // Scostamento incasso (solo consuntivati, con entrambi i valori valorizzati)
  const { data: consuntivati } = await supabase
    .from('servizi')
    .select('incasso_previsto, incasso_ricevuto')
    .gte('data_servizio', inizioMese)
    .lte('data_servizio', fineMese)
    .eq('stato', 'consuntivato')
    .not('incasso_ricevuto', 'is', null)
    .not('incasso_previsto', 'is', null);
  const scostamentoIncassoMese = consuntivati?.reduce(
    (s, x) => s + ((x.incasso_ricevuto ?? 0) - (x.incasso_previsto ?? 0)),
    0
  ) || 0;

  // Team totale (admin + socio + dipendente)
  const { count: teamTotale } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('role', ['admin','socio','dipendente']);

  // Team indisponibili oggi (shifts con tipo malattia/ferie/permesso/non_disponibile con data = oggi)
  const { data: shiftOggi } = await supabase
    .from('shifts')
    .select('user_id, shift_type, shift_date')
    .eq('shift_date', oggiStr)
    .in('shift_type', ['malattia','ferie','permesso','non_disponibile']);
  const teamIndisponibiliOggi = new Set(shiftOggi?.map(s => s.user_id) || []).size;

  // Veicoli attivi
  const { count: veicoliAttivi } = await supabase
    .from('veicoli')
    .select('*', { count: 'exact', head: true })
    .eq('attivo', true);

  return {
    richiesteClientiCount: richiesteClientiCount || 0,
    richiestaPiuVecchiaMinuti,
    daAssegnareCount: daAssegnareCount || 0,
    serviziOggiTotali,
    serviziOggiAssegnati,
    serviziOggiCompletati,
    ricaviMese,
    ricaviMeseScorso,
    serviziCompletatiMese: serviziCompletatiMese || 0,
    scostamentoIncassoMese,
    teamTotale: teamTotale || 0,
    teamIndisponibiliOggi,
    veicoliAttivi: veicoliAttivi || 0,
  };
}

async function fetchRecentActivity(): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  const { data: servizi } = await supabase
    .from('servizi')
    .select('id, created_at, created_by, stato, azienda_id, cliente_privato_nome, cliente_privato_cognome')
    .order('created_at', { ascending: false })
    .limit(5);

  if (servizi && servizi.length > 0) {
    const aziendeIds = servizi.filter(s => s.azienda_id).map(s => s.azienda_id!);
    const userIds = servizi.map(s => s.created_by).filter(Boolean) as string[];
    const [{ data: aziende }, { data: users }] = await Promise.all([
      aziendeIds.length ? supabase.from('aziende').select('id, nome').in('id', aziendeIds) : { data: [] },
      userIds.length ? supabase.from('profiles').select('id, first_name, last_name').in('id', userIds) : { data: [] },
    ]);
    const aziendeMap = new Map((aziende || []).map(a => [a.id, a.nome]));
    const usersMap = new Map((users || []).map(u => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]));

    servizi.forEach(s => {
      const aziendaNome = aziendeMap.get(s.azienda_id!) ||
        (s.cliente_privato_nome && s.cliente_privato_cognome
          ? `${s.cliente_privato_nome} ${s.cliente_privato_cognome}`
          : 'Cliente sconosciuto');
      activities.push({
        id: s.id,
        timestamp: s.created_at,
        event: `Nuovo servizio per ${aziendaNome}`,
        user: usersMap.get(s.created_by) || 'Utente',
        type: 'servizio',
      });
    });
  }

  const { data: turni } = await supabase
    .from('shifts')
    .select('id, created_at, shift_type, user_id')
    .order('created_at', { ascending: false })
    .limit(3);

  if (turni && turni.length > 0) {
    const userIds = turni.map(t => t.user_id);
    const { data: users } = await supabase.from('profiles').select('id, first_name, last_name').in('id', userIds);
    const usersMap = new Map((users || []).map(u => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]));
    const labelMap: Record<string, string> = {
      giornata_intera: 'Giornata intera', mezza_giornata: 'Mezza giornata', permesso: 'Permesso',
      malattia: 'Malattia', ferie: 'Ferie', non_disponibile: 'Non disponibile', extra: 'Extra',
    };
    turni.forEach(t => {
      activities.push({
        id: t.id,
        timestamp: t.created_at,
        event: `${labelMap[t.shift_type] || 'Turno'} inserito`,
        user: usersMap.get(t.user_id) || 'Utente',
        type: 'turno',
      });
    });
  }

  // Ordinamento per timestamp completo (non più solo HH:MM)
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}

export function useDashboardData() {
  const metrics = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const activities = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: fetchRecentActivity,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    metrics: metrics.data,
    isLoadingMetrics: metrics.isLoading,
    activities: activities.data || [],
    isLoadingActivities: activities.isLoading,
    isLoading: metrics.isLoading || activities.isLoading,
  };
}
