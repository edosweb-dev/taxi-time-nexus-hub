import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Servizio, StatoServizio } from '@/lib/types/servizi';

interface PasseggeroInfo {
  id: string;
  nome_cognome: string;
}

export interface ServizioWithPasseggeri extends Servizio {
  passeggeri?: PasseggeroInfo[];
  passeggeriCount?: number;
}

interface ServiziFilters {
  stato?: StatoServizio;
  azienda_id?: string;
  assegnato_a?: string;
  data_inizio?: string;
  data_fine?: string;
}

export const useServiziWithPasseggeri = (filters?: ServiziFilters) => {
  console.log('🔵 [useServiziWithPasseggeri] Hook called with filters:', filters);

  return useQuery({
    queryKey: ['servizi-with-passeggeri', filters],
    queryFn: async () => {
      console.log('🟢 [useServiziWithPasseggeri] Executing queryFn with filters:', filters);

      // Build query with filters
      let query = supabase
        .from('servizi')
        .select(`
          *,
          aziende:azienda_id (
            id,
            nome
          )
        `)
        .order('data_servizio', { ascending: false })
        .order('orario_servizio', { ascending: false });

      // Apply filters
      if (filters?.stato) {
        console.log('✅ [useServiziWithPasseggeri] Applying stato filter:', filters.stato);
        query = query.eq('stato', filters.stato);
      } else {
        console.log('⚠️ [useServiziWithPasseggeri] NO stato filter (fetching all)');
      }

      if (filters?.azienda_id) {
        query = query.eq('azienda_id', filters.azienda_id);
      }

      if (filters?.assegnato_a) {
        query = query.eq('assegnato_a', filters.assegnato_a);
      }

      if (filters?.data_inizio && filters?.data_fine) {
        query = query
          .gte('data_servizio', filters.data_inizio)
          .lte('data_servizio', filters.data_fine);
      }

      const { data: servizi, error: serviziError } = await query;

      if (serviziError) {
        console.error('❌ [useServiziWithPasseggeri] Query error:', serviziError);
        throw serviziError;
      }

      console.log('✅ [useServiziWithPasseggeri] Fetched servizi:', servizi?.length || 0);

      if (!servizi || servizi.length === 0) {
        return [];
      }

      // Get passeggeri for all servizi
      const serviziIds = servizi.map(s => s.id);
      const { data: passeggeriData, error: passeggeriError } = await supabase
        .from('servizi_passeggeri')
        .select(`
          servizio_id,
          passeggeri:passeggero_id (
            id,
            nome_cognome
          )
        `)
        .in('servizio_id', serviziIds);

      if (passeggeriError) throw passeggeriError;

      // Map passeggeri to servizi
      const serviziWithPasseggeri: ServizioWithPasseggeri[] = servizi.map(servizio => {
        const servizioPasseggeri = passeggeriData?.filter(
          p => p.servizio_id === servizio.id
        ) || [];

        const passeggeri = servizioPasseggeri
          .map(p => p.passeggeri)
          .filter((p): p is PasseggeroInfo => p !== null);

        return {
          ...(servizio as Servizio),
          passeggeri,
          passeggeriCount: passeggeri.length
        };
      });

      return serviziWithPasseggeri;
    }
  });
};
