import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IncassoCarta {
  servizio_id: string;
  id_progressivo: string | null;
  data_servizio: string;
  azienda_nome: string | null;
  cliente_privato_nome: string | null;
  assegnato_a_nome: string | null;
  assegnato_role: string | null;
  incasso_ricevuto: number | null;
  incasso_previsto: number | null;
  stato: string;
}

interface UseIncassiCartaParams {
  dataInizio: string;
  dataFine: string;
}

interface IncassiStats {
  totaleIncassi: number;
  numeroServizi: number;
}

export function useIncassiCarta({ dataInizio, dataFine }: UseIncassiCartaParams) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['incassi-carta', dataInizio, dataFine],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servizi')
        .select(`
          id,
          id_progressivo,
          data_servizio,
          incasso_ricevuto,
          incasso_previsto,
          stato,
          azienda_id,
          cliente_privato_id,
          assegnato_a,
          aziende!servizi_azienda_id_fkey ( nome ),
          assegnato:profiles!servizi_assegnato_a_fkey ( first_name, last_name, role )
        `)
        .eq('metodo_pagamento', 'Carta')
        .gte('data_servizio', dataInizio)
        .lte('data_servizio', dataFine)
        .order('data_servizio', { ascending: false });

      if (error) throw error;

      const incassi: IncassoCarta[] = (data || []).map((servizio: any) => {
        const assegnatoProfile = servizio.assegnato;
        const azienda = servizio.aziende;
        let clientePrivatoNome = null;
        if (servizio.cliente_privato_id) clientePrivatoNome = 'Cliente Privato';

        return {
          servizio_id: servizio.id,
          id_progressivo: servizio.id_progressivo,
          data_servizio: servizio.data_servizio,
          azienda_nome: azienda?.nome || null,
          cliente_privato_nome: clientePrivatoNome,
          assegnato_a_nome: assegnatoProfile
            ? `${assegnatoProfile.first_name || ''} ${assegnatoProfile.last_name || ''}`.trim()
            : null,
          assegnato_role: assegnatoProfile?.role || null,
          incasso_ricevuto: servizio.incasso_ricevuto,
          incasso_previsto: servizio.incasso_previsto,
          stato: servizio.stato,
        };
      });

      return incassi;
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

  const stats: IncassiStats = {
    totaleIncassi: (data || []).reduce(
      (sum, incasso) => sum + (incasso.incasso_ricevuto || incasso.incasso_previsto || 0),
      0
    ),
    numeroServizi: (data || []).length,
  };

  return { incassi: data || [], isLoading, isFetching, error, stats };
}
