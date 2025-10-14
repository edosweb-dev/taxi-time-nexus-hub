import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shift } from '@/lib/utils/turniHelpers';

export function useTurniMese(year: number, month: number) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['turni-mese', profile?.id, year, month],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', profile.id)
        .gte('shift_date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lte('shift_date', `${year}-${String(month).padStart(2, '0')}-31`)
        .order('shift_date', { ascending: true });

      if (error) {
        console.error('Error fetching turni:', error);
        throw error;
      }

      return (data || []) as Shift[];
    },
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}
