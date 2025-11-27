import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths } from "date-fns";

interface DashboardMetrics {
  serviziOggi: number;
  serviziIeri: number;
  ricaviMese: number;
  ricaviMeseScorso: number;
  veicoliAttivi: number;
  totaleUtenti: number;
}

interface RecentActivity {
  id: string;
  time: string;
  event: string;
  user: string;
  type: 'servizio' | 'turno' | 'feedback';
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const oggi = new Date();
  const ieri = new Date(oggi);
  ieri.setDate(ieri.getDate() - 1);
  
  const inizioMese = startOfMonth(oggi);
  const fineMese = endOfMonth(oggi);
  const inizioMeseScorso = startOfMonth(subMonths(oggi, 1));
  const fineMeseScorso = endOfMonth(subMonths(oggi, 1));

  // Servizi oggi
  const { count: serviziOggi } = await supabase
    .from('servizi')
    .select('*', { count: 'exact', head: true })
    .eq('data_servizio', format(oggi, 'yyyy-MM-dd'));

  // Servizi ieri
  const { count: serviziIeri } = await supabase
    .from('servizi')
    .select('*', { count: 'exact', head: true })
    .eq('data_servizio', format(ieri, 'yyyy-MM-dd'));

  // Ricavi mese corrente (servizi completati)
  const { data: serviziMese } = await supabase
    .from('servizi')
    .select('incasso_ricevuto, incasso_previsto')
    .gte('data_servizio', format(inizioMese, 'yyyy-MM-dd'))
    .lte('data_servizio', format(fineMese, 'yyyy-MM-dd'))
    .in('stato', ['completato', 'consuntivato']);

  const ricaviMese = serviziMese?.reduce((sum, s) => {
    return sum + (s.incasso_ricevuto || s.incasso_previsto || 0);
  }, 0) || 0;

  // Ricavi mese scorso
  const { data: serviziMeseScorso } = await supabase
    .from('servizi')
    .select('incasso_ricevuto, incasso_previsto')
    .gte('data_servizio', format(inizioMeseScorso, 'yyyy-MM-dd'))
    .lte('data_servizio', format(fineMeseScorso, 'yyyy-MM-dd'))
    .in('stato', ['completato', 'consuntivato']);

  const ricaviMeseScorso = serviziMeseScorso?.reduce((sum, s) => {
    return sum + (s.incasso_ricevuto || s.incasso_previsto || 0);
  }, 0) || 0;

  // Veicoli attivi
  const { count: veicoliAttivi } = await supabase
    .from('veicoli')
    .select('*', { count: 'exact', head: true })
    .eq('attivo', true);

  // Totale utenti
  const { count: totaleUtenti } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return {
    serviziOggi: serviziOggi || 0,
    serviziIeri: serviziIeri || 0,
    ricaviMese,
    ricaviMeseScorso,
    veicoliAttivi: veicoliAttivi || 0,
    totaleUtenti: totaleUtenti || 0
  };
}

async function fetchRecentActivity(): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  // Ultimi 5 servizi creati
  const { data: servizi } = await supabase
    .from('servizi')
    .select('id, created_at, created_by, stato, azienda_id, cliente_privato_nome, cliente_privato_cognome')
    .order('created_at', { ascending: false })
    .limit(5);

  if (servizi) {
    // Recupera nomi aziende
    const aziendeIds = servizi.filter(s => s.azienda_id).map(s => s.azienda_id!);
    const { data: aziende } = await supabase
      .from('aziende')
      .select('id, nome')
      .in('id', aziendeIds);

    // Recupera nomi utenti
    const userIds = servizi.map(s => s.created_by);
    const { data: users } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    const aziendeMap = new Map(aziende?.map(a => [a.id, a.nome]) || []);
    const usersMap = new Map(users?.map(u => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]) || []);

    servizi.forEach(s => {
      const aziendaNome = aziendeMap.get(s.azienda_id!) || 
        (s.cliente_privato_nome && s.cliente_privato_cognome 
          ? `${s.cliente_privato_nome} ${s.cliente_privato_cognome}` 
          : 'Cliente sconosciuto');
      
      const userName = usersMap.get(s.created_by) || 'Utente';

      activities.push({
        id: s.id,
        time: format(new Date(s.created_at), 'HH:mm'),
        event: `Nuovo servizio per ${aziendaNome}`,
        user: userName,
        type: 'servizio'
      });
    });
  }

  // Ultimi 3 turni creati
  const { data: turni } = await supabase
    .from('shifts')
    .select('id, created_at, shift_type, user_id')
    .order('created_at', { ascending: false })
    .limit(3);

  if (turni) {
    const userIds = turni.map(t => t.user_id);
    const { data: users } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    const usersMap = new Map(users?.map(u => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]) || []);

    turni.forEach(t => {
      const userName = usersMap.get(t.user_id) || 'Utente';

      const shiftTypeLabel = {
        'giornata_intera': 'Giornata intera',
        'mezza_giornata': 'Mezza giornata',
        'permesso': 'Permesso',
        'malattia': 'Malattia',
        'ferie': 'Ferie',
        'non_disponibile': 'Non disponibile',
        'extra': 'Extra'
      }[t.shift_type] || 'Turno';

      activities.push({
        id: t.id,
        time: format(new Date(t.created_at), 'HH:mm'),
        event: `${shiftTypeLabel} inserito`,
        user: userName,
        type: 'turno'
      });
    });
  }

  // Ultimi 2 feedback
  const { data: feedbacks } = await supabase
    .from('feedback')
    .select('id, created_at, tipo, user_id')
    .order('created_at', { ascending: false })
    .limit(2);

  if (feedbacks) {
    const userIds = feedbacks.filter(f => f.user_id).map(f => f.user_id!);
    const { data: users } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    const usersMap = new Map(users?.map(u => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim()]) || []);

    feedbacks.forEach(f => {
      const userName = f.user_id ? (usersMap.get(f.user_id) || 'Utente registrato') : 'Anonimo';

      activities.push({
        id: f.id,
        time: format(new Date(f.created_at), 'HH:mm'),
        event: `Nuovo ${f.tipo}`,
        user: userName,
        type: 'feedback'
      });
    });
  }

  // Ordina per orario (più recenti primi)
  return activities
    .sort((a, b) => {
      const timeA = a.time.split(':').map(Number);
      const timeB = b.time.split(':').map(Number);
      return timeB[0] * 60 + timeB[1] - (timeA[0] * 60 + timeA[1]);
    })
    .slice(0, 10);
}

export function useDashboardData() {
  const metrics = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 2 * 60 * 1000, // 2 minuti
    refetchOnWindowFocus: true
  });

  const activities = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: fetchRecentActivity,
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnWindowFocus: true
  });

  return {
    metrics: metrics.data,
    isLoadingMetrics: metrics.isLoading,
    activities: activities.data || [],
    isLoadingActivities: activities.isLoading,
    isLoading: metrics.isLoading || activities.isLoading
  };
}
