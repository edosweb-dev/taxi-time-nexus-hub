import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Servizio } from '@/lib/types/servizi';

interface PasseggeroInfo {
  id: string;
  nome_cognome: string;
}

export interface ServizioWithPasseggeri extends Servizio {
  passeggeri?: PasseggeroInfo[];
  passeggeriCount?: number;
  assegnato?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  } | null;
}

export const useServiziWithPasseggeri = () => {
  return useQuery({
    queryKey: ['servizi-with-passeggeri'],
    queryFn: async () => {
      // Get all servizi
      const { data: servizi, error: serviziError } = await supabase
        .from('servizi')
        .select(`
          *,
          aziende:azienda_id (
            id,
            nome
          ),
          assegnato:profiles!servizi_assegnato_a_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (serviziError) throw serviziError;

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
