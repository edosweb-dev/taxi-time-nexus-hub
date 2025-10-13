import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, endOfMonth, parseISO, isSameDay } from 'date-fns';
import { ServizioWithRelations } from '@/lib/api/dipendente/servizi';

interface UseServiziAgendaParams {
  userId: string;
  month: number;
  year: number;
  filtri?: {
    stati?: string[];
    aziendaId?: string;
  };
}

export function useServiziAgenda(params: UseServiziAgendaParams) {
  return useQuery({
    queryKey: ['servizi-agenda', params.userId, params.month, params.year, params.filtri],
    queryFn: async () => {
      const startDate = format(new Date(params.year, params.month - 1, 1), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(params.year, params.month - 1)), 'yyyy-MM-dd');
      
      let query = supabase
        .from('servizi')
        .select(`
          *,
          aziende (nome),
          veicoli (modello, targa)
        `)
        .eq('assegnato_a', params.userId)
        .gte('data_servizio', startDate)
        .lte('data_servizio', endDate)
        .order('data_servizio', { ascending: true })
        .order('orario_servizio', { ascending: true });
      
      if (params.filtri?.stati && params.filtri.stati.length > 0) {
        query = query.in('stato', params.filtri.stati);
      }
      
      if (params.filtri?.aziendaId) {
        query = query.eq('azienda_id', params.filtri.aziendaId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform data to match ServizioWithRelations type
      return (data || []).map(servizio => ({
        ...servizio,
        azienda_nome: servizio.aziende?.nome || null,
        veicolo_modello: servizio.veicoli?.modello || null,
        veicolo_targa: servizio.veicoli?.targa || null
      })) as unknown as ServizioWithRelations[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true
  });
}

export function getServiziByDay(
  servizi: ServizioWithRelations[],
  date: Date
): ServizioWithRelations[] {
  return servizi.filter(s => 
    isSameDay(parseISO(s.data_servizio), date)
  ).sort((a, b) => a.orario_servizio.localeCompare(b.orario_servizio));
}
