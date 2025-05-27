
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SpesaDipendente {
  id: string;
  user_id: string;
  importo: number;
  causale: string;
  note?: string;
  created_at: string;
  converted_to_spesa_aziendale: boolean;
  // Dati del profilo quando fetchati insieme
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface CreateSpesaData {
  importo: number;
  causale: string;
  note?: string;
}

export interface SpeseFilters {
  user_id?: string;
  startDate?: string;
  endDate?: string;
}

export function useSpeseDipendenti(filters?: SpeseFilters) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Query per le spese
  const {
    data: spese = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['spese-dipendenti', filters],
    queryFn: async (): Promise<SpesaDipendente[]> => {
      if (!profile) throw new Error('Utente non autenticato');

      let query = supabase
        .from('spese_dipendenti')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      // Se è un dipendente, mostra solo le sue spese
      if (profile.role === 'dipendente') {
        query = query.eq('user_id', profile.id);
      }

      // Applicazione filtri per admin/socio
      if (filters?.user_id && ['admin', 'socio'].includes(profile.role)) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile
  });

  // Mutation per aggiungere una spesa
  const addSpesaMutation = useMutation({
    mutationFn: async (spesaData: CreateSpesaData): Promise<SpesaDipendente> => {
      if (!profile) throw new Error('Utente non autenticato');

      const { data, error } = await supabase
        .from('spese_dipendenti')
        .insert({
          user_id: profile.id,
          importo: spesaData.importo,
          causale: spesaData.causale,
          note: spesaData.note || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spese-dipendenti'] });
      toast.success('Spesa inserita con successo');
    },
    onError: (error: any) => {
      console.error('Errore durante l\'inserimento della spesa:', error);
      toast.error('Errore durante l\'inserimento della spesa');
    }
  });

  // Query per le statistiche del mese corrente (solo per dipendenti)
  const { data: statsCurrentMonth } = useQuery({
    queryKey: ['spese-stats-current-month', profile?.id],
    queryFn: async () => {
      if (!profile || profile.role !== 'dipendente') return null;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('spese_dipendenti')
        .select('importo')
        .eq('user_id', profile.id)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const total = data?.reduce((sum, spesa) => sum + Number(spesa.importo), 0) || 0;
      return { total, count: data?.length || 0 };
    },
    enabled: !!profile && profile.role === 'dipendente'
  });

  return {
    spese,
    isLoading,
    error,
    refetch,
    addSpesa: addSpesaMutation.mutate,
    isAddingSpesa: addSpesaMutation.isPending,
    statsCurrentMonth
  };
}

// Hook specifico per ottenere gli utenti dipendenti (per i filtri admin/socio)
export function useDipendenti() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['dipendenti'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'dipendente')
        .order('first_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile && ['admin', 'socio'].includes(profile.role)
  });
}
