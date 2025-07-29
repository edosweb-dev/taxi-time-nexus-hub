import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Passeggero } from '@/lib/types/servizi';

export function usePasseggeri(aziendaId?: string, referenteId?: string) {
  return useQuery({
    queryKey: ['passeggeri', aziendaId, referenteId],
    queryFn: async () => {
      if (!aziendaId && !referenteId) return { passeggeri: [], isLoading: false };
      
      let query = supabase.from('passeggeri').select('*');
      
      if (aziendaId) {
        query = query.eq('azienda_id', aziendaId);
      }
      
      if (referenteId) {
        query = query.eq('referente_id', referenteId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching passeggeri:', error);
        throw error;
      }

      return { passeggeri: data as Passeggero[], isLoading: false };
    },
    enabled: !!(aziendaId || referenteId),
    select: (data) => ({
      passeggeri: data?.passeggeri || [],
      isLoading: false
    })
  });
}