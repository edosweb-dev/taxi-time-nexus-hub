import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Passeggero } from '@/lib/types/servizi';

export function usePasseggeri(aziendaId?: string) {
  const query = useQuery({
    queryKey: ['passeggeri-azienda', aziendaId],  // Query key univoca per evitare conflitti
    queryFn: async () => {
      if (!aziendaId) return [];

      console.log('[usePasseggeri] 📊 Fetching passengers for:', aziendaId);

      const { data, error } = await supabase
        .from('passeggeri')
        .select('*')
        .eq('azienda_id', aziendaId)
        .eq('tipo', 'rubrica')
        .order('nome_cognome', { ascending: true });

      if (error) {
        console.error('[usePasseggeri] ❌ Error:', error);
        throw error;
      }

      console.log('[usePasseggeri] ✅ Loaded:', data?.length, 'passengers');
      return data as Passeggero[];
    },
    enabled: !!aziendaId,
    staleTime: 30 * 1000,  // 30 secondi cache
  });

  return {
    data: {
      passeggeri: query.data || [],
      isLoading: query.isLoading || query.isFetching,
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
