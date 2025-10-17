import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getStipendiAutomaticiMese, StipendiAutomaticoUtente } from '@/lib/api/stipendi/calcoloAutomaticoStipendi';

export function useStipendiAutomatici(mese: number, anno: number) {
  const queryClient = useQueryClient();

  // Setup Realtime listener
  useEffect(() => {
    const channel = supabase
      .channel(`stipendi-${mese}-${anno}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stipendi',
          filter: `mese=eq.${mese},anno=eq.${anno}`,
        },
        (payload) => {
          console.log('📡 Realtime: Stipendio aggiornato', payload);
          queryClient.invalidateQueries({ 
            queryKey: ['stipendi-automatici', mese, anno] 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mese, anno, queryClient]);

  return useQuery({
    queryKey: ['stipendi-automatici', mese, anno],
    queryFn: () => getStipendiAutomaticiMese(mese, anno),
    staleTime: 1000 * 60 * 5, // 5 minuti
    retry: 1,
  });
}
