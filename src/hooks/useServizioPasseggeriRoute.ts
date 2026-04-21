import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PasseggeroRouteRow {
  luogo_presa_personalizzato: string | null;
  destinazione_personalizzato: string | null;
  passeggero: { indirizzo: string | null } | null;
}

/**
 * Hook leggero per recuperare solo i campi di indirizzo dei passeggeri
 * di un servizio. Usato per validare il percorso prima dell'assegnazione.
 */
export function useServizioPasseggeriRoute(servizioId?: string, enabled = true) {
  return useQuery({
    queryKey: ['servizio-passeggeri-route', servizioId],
    enabled: !!servizioId && enabled,
    staleTime: 30 * 1000,
    queryFn: async (): Promise<PasseggeroRouteRow[]> => {
      const { data, error } = await supabase
        .from('servizi_passeggeri')
        .select('luogo_presa_personalizzato, destinazione_personalizzato, passeggero:passeggeri(indirizzo)')
        .eq('servizio_id', servizioId!);

      if (error) throw error;
      return (data || []) as unknown as PasseggeroRouteRow[];
    },
  });
}
