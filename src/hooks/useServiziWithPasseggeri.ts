import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Servizio } from '@/lib/types/servizi';

export interface PasseggeroInfo {
  id: string;
  nome_cognome: string;
  destinazione_personalizzato?: string | null;
  localita_destinazione_personalizzato?: string | null;
  luogo_presa_personalizzato?: string | null;
  localita_presa_personalizzato?: string | null;
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
      // ✅ FIX: Single query con resource embedding (evita IN(...) gigante che genera HTTP 400)
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
          ),
          servizi_passeggeri (
            passeggero_id,
            nome_cognome_inline,
            destinazione_personalizzato,
            localita_destinazione_personalizzato,
            luogo_presa_personalizzato,
            localita_presa_personalizzato,
            passeggeri:passeggero_id (
              id,
              nome_cognome
            )
          )
        `)
        .order('data_servizio', { ascending: false })
        .order('orario_servizio', { ascending: false });

      if (serviziError) throw serviziError;

      if (!servizi || servizi.length === 0) {
        return [];
      }

      // Map embedded passeggeri
      const serviziWithPasseggeri: ServizioWithPasseggeri[] = servizi.map((servizio: any) => {
        const servizioPasseggeri = Array.isArray(servizio.servizi_passeggeri)
          ? servizio.servizi_passeggeri
          : [];

        const passeggeriCount = servizioPasseggeri.length;

        const passeggeri: PasseggeroInfo[] = servizioPasseggeri.map((p: any) => {
          const base = {
            destinazione_personalizzato: p.destinazione_personalizzato,
            localita_destinazione_personalizzato: p.localita_destinazione_personalizzato,
            luogo_presa_personalizzato: p.luogo_presa_personalizzato,
            localita_presa_personalizzato: p.localita_presa_personalizzato,
          };
          if (p.passeggeri) {
            return { ...base, id: p.passeggeri.id, nome_cognome: p.passeggeri.nome_cognome };
          } else {
            return {
              ...base,
              id: p.passeggero_id || `temp-${servizio.id}`,
              nome_cognome: p.nome_cognome_inline || 'N/A',
            };
          }
        });

        // Strip embedded relation to keep Servizio shape clean
        const { servizi_passeggeri: _omit, ...servizioClean } = servizio;

        return {
          ...(servizioClean as Servizio),
          passeggeri,
          passeggeriCount,
        };
      });

      return serviziWithPasseggeri;
    },
  });
};
