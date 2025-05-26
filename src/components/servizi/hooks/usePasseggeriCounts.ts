
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Servizio } from '@/lib/types/servizi';

export const usePasseggeriCounts = (servizi?: Servizio[]) => {
  const { data: passeggeriData, isLoading } = useQuery({
    queryKey: ['passeggeriCounts', servizi?.map(s => s.id)],
    queryFn: async () => {
      // Ora usiamo la tabella servizi_passeggeri per contare i passeggeri
      let query = supabase.from('servizi_passeggeri').select('servizio_id');
      
      if (servizi && servizi.length > 0) {
        const serviziIds = servizi.map(s => s.id);
        query = query.in('servizio_id', serviziIds);
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching passeggeri counts:', error);
        return [];
      }
      
      return data;
    },
  });
  
  // Count passeggeri per servizio
  const passeggeriCounts = (passeggeriData || []).reduce((acc: Record<string, number>, p) => {
    acc[p.servizio_id] = (acc[p.servizio_id] || 0) + 1;
    return acc;
  }, {});
  
  return {
    passeggeriCounts,
    isLoading,
  };
};
