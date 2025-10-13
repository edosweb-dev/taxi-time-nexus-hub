import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export interface StipendioDettaglio {
  id: string;
  user_id: string;
  mese: number;
  anno: number;
  stato: 'bozza' | 'confermato' | 'pagato';
  tipo_calcolo: string;
  totale_netto: number;
  totale_lordo: number;
  base_calcolo: number;
  coefficiente_applicato: number;
  totale_km: number;
  totale_ore_lavorate: number;
  totale_ore_attesa: number;
  totale_spese: number;
  totale_prelievi: number;
  incassi_da_dipendenti: number;
  riporto_mese_precedente: number;
  note?: string | null;
  created_at: string;
  created_by: string;
  creator_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface StipendiFilters {
  anno: number;
  stato?: 'confermato' | 'pagato';
}

export function useStipendiDipendente(filters: StipendiFilters) {
  const { user } = useAuth();

  // Fetch stipendi for the year
  const { data: stipendi = [], isLoading, error } = useQuery({
    queryKey: ['stipendi-dipendente', user?.id, filters.anno, filters.stato],
    queryFn: async (): Promise<StipendioDettaglio[]> => {
      if (!user) throw new Error('Utente non autenticato');

      let query = supabase
        .from('stipendi')
        .select(`
          *
        `)
        .eq('user_id', user.id)
        .eq('anno', filters.anno)
        .neq('stato', 'bozza') // Hide drafts from employee
        .order('mese', { ascending: false });

      if (filters.stato) {
        query = query.eq('stato', filters.stato);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch creator profiles separately if needed
      const stipendiWithProfiles = await Promise.all(
        (data || []).map(async (stipendio) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', stipendio.created_by)
            .maybeSingle();

          return {
            ...stipendio,
            creator_profile: profile || undefined
          };
        })
      );

      return stipendiWithProfiles as StipendioDettaglio[];
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Calculate stats for the year
  const stats = useMemo(() => {
    const stipendiPagati = stipendi.filter(s => s.stato === 'pagato');
    
    const totalePagato = stipendiPagati.reduce(
      (acc, s) => acc + Number(s.totale_netto || 0), 
      0
    );

    const mediaMensile = stipendiPagati.length > 0
      ? totalePagato / stipendiPagati.length
      : 0;

    const ultimoPagamento = [...stipendi]
      .sort((a, b) => {
        if (a.anno !== b.anno) return b.anno - a.anno;
        return b.mese - a.mese;
      })[0];

    return {
      totalePagato,
      mediaMensile,
      numeroStipendi: stipendi.length,
      ultimoPagamento: ultimoPagamento ? {
        mese: ultimoPagamento.mese,
        anno: ultimoPagamento.anno,
        importo: Number(ultimoPagamento.totale_netto || 0),
      } : null,
    };
  }, [stipendi]);

  return {
    stipendi,
    stats,
    isLoading,
    error,
  };
}

// Hook to get available years
export function useAnniDisponibili() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stipendi-anni', user?.id],
    queryFn: async (): Promise<number[]> => {
      if (!user) throw new Error('Utente non autenticato');

      const { data, error } = await supabase
        .from('stipendi')
        .select('anno')
        .eq('user_id', user.id)
        .neq('stato', 'bozza');

      if (error) throw error;

      // Get unique years and sort descending
      const anni = [...new Set(data?.map(s => s.anno) || [])].sort((a, b) => b - a);
      
      // If no years, return current year
      if (anni.length === 0) {
        return [new Date().getFullYear()];
      }

      return anni;
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
