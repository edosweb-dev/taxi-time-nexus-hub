import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/lib/types';

export function useReferenti(aziendaId?: string) {
  return useQuery({
    queryKey: ['referenti', aziendaId],
    queryFn: async () => {
      if (!aziendaId) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('azienda_id', aziendaId)
        .eq('role', 'cliente');

      if (error) {
        console.error('Error fetching referenti:', error);
        throw error;
      }

      return data.map(profile => ({
        ...profile,
        role: profile.role as UserRole
      })) as Profile[];
    },
    enabled: !!aziendaId,
  });
}

export function useAllReferenti() {
  return useQuery({
    queryKey: ['all-referenti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'cliente');

      if (error) {
        console.error('Error fetching all referenti:', error);
        throw error;
      }

      // Group by azienda_id and cast roles
      const referentiByAzienda = data.reduce((acc, profile) => {
        if (profile.azienda_id) {
          if (!acc[profile.azienda_id]) {
            acc[profile.azienda_id] = [];
          }
          acc[profile.azienda_id].push({
            ...profile,
            role: profile.role as UserRole
          } as Profile);
        }
        return acc;
      }, {} as Record<string, Profile[]>);

      return referentiByAzienda;
    },
  });
}