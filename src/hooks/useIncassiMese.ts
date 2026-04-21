import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseIncassiMeseParams {
  dataInizio: string; // 'yyyy-MM-dd'
  dataFine: string;   // 'yyyy-MM-dd'
}

export function useIncassiMese({ dataInizio, dataFine }: UseIncassiMeseParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['incassi-mese', dataInizio, dataFine],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servizi')
        .select('incasso_ricevuto, incasso_previsto, stato, metodo_pagamento')
        .gte('data_servizio', dataInizio)
        .lte('data_servizio', dataFine);

      if (error) throw error;

      const totaleIncassi = (data || []).reduce(
        (sum, s) => sum + Number(s.incasso_ricevuto ?? s.incasso_previsto ?? 0),
        0
      );
      return { totaleIncassi, numeroServizi: (data || []).length };
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

  return { stats: data ?? { totaleIncassi: 0, numeroServizi: 0 }, isLoading, error };
}
