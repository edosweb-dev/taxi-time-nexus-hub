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
    staleTime: 2 * 60 * 1000, // 2 minuti - dati operativi
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
        .order('data_servizio', { ascending: true })
        .order('orario_servizio', { ascending: true });

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
          passeggero_id,
          nome_cognome_inline,
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

        // ✅ Conta TUTTI i passeggeri (permanenti + temporanei)
        const passeggeriCount = servizioPasseggeri.length;

        // Crea array passeggeri includendo entrambi i tipi
        const passeggeri = servizioPasseggeri.map(p => {
          if (p.passeggeri) {
            // Passeggero permanente (da rubrica)
            return {
              id: p.passeggeri.id,
              nome_cognome: p.passeggeri.nome_cognome
            };
          } else {
            // Passeggero temporaneo (inline)
            return {
              id: p.passeggero_id || `temp-${p.servizio_id}`,
              nome_cognome: p.nome_cognome_inline || 'N/A'
            };
          }
        });

        return {
          ...(servizio as Servizio),
          passeggeri,
          passeggeriCount
        };
      });

      return serviziWithPasseggeri;
    }
  });
};
