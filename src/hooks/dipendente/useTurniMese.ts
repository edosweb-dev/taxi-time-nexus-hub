import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shift } from '@/lib/utils/turniHelpers';

export function useTurniMese(year: number, month: number, filterUserId?: string) {
  const { profile } = useAuth();
  const userId = filterUserId || profile?.id;

  return useQuery({
    queryKey: ['turni-mese', userId, year, month],
    queryFn: async () => {
      if (!userId) return [];

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

      let query = supabase
        .from('shifts')
        .select('*')
        .gte('shift_date', startDate)
        .lte('shift_date', endDate);

      // Filter by user if specified
      if (filterUserId) {
        query = query.eq('user_id', filterUserId);
      } else if (profile?.id) {
        // Default: filter by current user for dipendente
        query = query.eq('user_id', profile.id);
      }

      const { data, error } = await query.order('shift_date', { ascending: true });

      if (error) {
        console.error('Error fetching turni:', error);
        throw error;
      }

      return (data || []) as Shift[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}
