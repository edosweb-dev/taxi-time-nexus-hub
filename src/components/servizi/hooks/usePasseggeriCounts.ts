
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const usePasseggeriCounts = () => {
  const { data: passeggeriData, isLoading } = useQuery({
    queryKey: ['passeggeriCounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passeggeri')
        .select('servizio_id');
        
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
