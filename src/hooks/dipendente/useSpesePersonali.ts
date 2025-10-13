import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export interface SpesaPersonale {
  id: string;
  user_id: string;
  importo: number;
  causale: string;
  note?: string | null;
  created_at: string;
  data_spesa: string;
  stato: 'in_attesa' | 'approvata' | 'non_autorizzata' | 'in_revisione';
  registered_by: string;
  approved_by?: string | null;
  approved_at?: string | null;
  note_revisione?: string | null;
  converted_to_spesa_aziendale: boolean;
  approved_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface SpeseFiltersOptions {
  stato?: string;
  dateStart?: string;
  dateEnd?: string;
  importoMin?: number;
  importoMax?: number;
  search?: string;
}

export function useSpesePersonali(filters?: SpeseFiltersOptions) {
  const { user } = useAuth();

  const { data: spese = [], isLoading, error } = useQuery({
    queryKey: ['spese-dipendente', user?.id, filters],
    queryFn: async (): Promise<SpesaPersonale[]> => {
      if (!user) throw new Error('Utente non autenticato');

      let query = supabase
        .from('spese_dipendenti')
        .select(`
          *,
          approved_by_profile:profiles!approved_by (
            first_name,
            last_name
          )
        `)
        .eq('user_id', user.id)
        .order('data_spesa', { ascending: false });

      // Apply filters
      if (filters?.stato && filters.stato !== 'tutte') {
        query = query.eq('stato', filters.stato);
      }

      if (filters?.dateStart) {
        query = query.gte('data_spesa', filters.dateStart);
      }

      if (filters?.dateEnd) {
        query = query.lte('data_spesa', filters.dateEnd);
      }

      if (filters?.importoMin !== undefined) {
        query = query.gte('importo', filters.importoMin);
      }

      if (filters?.importoMax !== undefined) {
        query = query.lte('importo', filters.importoMax);
      }

      if (filters?.search) {
        query = query.ilike('causale', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as SpesaPersonale[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });

  // Calculate stats
  const stats = useMemo(() => {
    const inAttesa = spese
      .filter(s => s.stato === 'in_attesa')
      .reduce((acc, s) => ({
        totale: acc.totale + Number(s.importo),
        count: acc.count + 1
      }), { totale: 0, count: 0 });

    const approvate = spese
      .filter(s => s.stato === 'approvata')
      .reduce((acc, s) => ({
        totale: acc.totale + Number(s.importo),
        count: acc.count + 1
      }), { totale: 0, count: 0 });

    const rifiutate = spese
      .filter(s => s.stato === 'non_autorizzata')
      .reduce((acc, s) => ({
        totale: acc.totale + Number(s.importo),
        count: acc.count + 1
      }), { totale: 0, count: 0 });

    const totaleMese = spese.reduce((sum, s) => sum + Number(s.importo), 0);

    return {
      inAttesa,
      approvate,
      rifiutate,
      totaleMese
    };
  }, [spese]);

  return {
    spese,
    stats,
    isLoading,
    error
  };
}
