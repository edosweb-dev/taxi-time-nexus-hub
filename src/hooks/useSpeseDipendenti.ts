
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
  data_spesa: string;
  stato: 'in_attesa' | 'approvata' | 'non_autorizzata' | 'in_revisione';
  registered_by: string;
  approved_by?: string;
  approved_at?: string;
  note_revisione?: string;
  converted_to_spesa_aziendale: boolean;
  // Dati dei profili quando fetchati insieme
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
  registered_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
  approved_by_profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface CreateSpesaData {
  user_id?: string; // Per admin/socio che registrano per altri
  importo: number;
  causale: string;
  note?: string;
  data_spesa?: string;
}

export interface UpdateSpesaStatusData {
  id: string;
  stato: 'in_attesa' | 'approvata' | 'non_autorizzata' | 'in_revisione';
  note_revisione?: string;
}

export interface SpeseFilters {
  user_id?: string;
  stato?: string;
  startDate?: string;
  endDate?: string;
  registered_by?: string;
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
          user_profile:profiles!user_id (
            first_name,
            last_name
          ),
          registered_by_profile:profiles!registered_by (
            first_name,
            last_name
          ),
          approved_by_profile:profiles!approved_by (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      // Applicazione filtri
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters?.stato) {
        query = query.eq('stato', filters.stato);
      }

      if (filters?.registered_by) {
        query = query.eq('registered_by', filters.registered_by);
      }

      if (filters?.startDate) {
        query = query.gte('data_spesa', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('data_spesa', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as SpesaDipendente[];
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
          user_id: spesaData.user_id || profile.id,
          importo: spesaData.importo,
          causale: spesaData.causale,
          note: spesaData.note || null,
          data_spesa: spesaData.data_spesa || new Date().toISOString().split('T')[0],
          registered_by: profile.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as SpesaDipendente;
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

  // Mutation per aggiornare lo stato di una spesa
  const updateSpesaStatusMutation = useMutation({
    mutationFn: async (updateData: UpdateSpesaStatusData): Promise<SpesaDipendente> => {
      if (!profile) throw new Error('Utente non autenticato');

      const { data, error } = await supabase
        .from('spese_dipendenti')
        .update({
          stato: updateData.stato,
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
          note_revisione: updateData.note_revisione || null
        })
        .eq('id', updateData.id)
        .select()
        .single();

      if (error) throw error;
      return data as SpesaDipendente;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spese-dipendenti'] });
      toast.success('Stato spesa aggiornato con successo');
    },
    onError: (error: any) => {
      console.error('Errore durante l\'aggiornamento dello stato:', error);
      toast.error('Errore durante l\'aggiornamento dello stato');
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
        .gte('data_spesa', startOfMonth.toISOString().split('T')[0]);

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
    updateSpesaStatus: updateSpesaStatusMutation.mutate,
    isUpdatingSpesaStatus: updateSpesaStatusMutation.isPending,
    statsCurrentMonth
  };
}

// Hook per ottenere gli utenti dipendenti (per i filtri e select admin/socio)
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
