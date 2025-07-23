import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';

export function useReferenti(aziendaId: string | undefined) {
  return useQuery({
    queryKey: ['referenti', aziendaId],
    queryFn: async () => {
      if (!aziendaId) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('azienda_id', aziendaId)
        .eq('role', 'cliente')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching referenti:', error);
        throw error;
      }

      return data as Profile[];
    },
    enabled: !!aziendaId,
  });
}