import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Passeggero {
  id: string;
  nome_cognome: string;
  nome?: string;
  cognome?: string;
  email?: string;
  telefono?: string;
  telefono_2?: string | null;
  indirizzo?: string;
  localita?: string;
  azienda_id: string;
  created_by_referente_id?: string;
  created_at: string;
}

export function usePasseggeriByReferente(referenteId?: string) {
  return useQuery({
    queryKey: ['passeggeri', 'referente', referenteId],
    queryFn: async () => {
      if (!referenteId) return [];
      
      // Prima recupera l'azienda_id del referente
      const { data: referenteProfile } = await supabase
        .from('profiles')
        .select('azienda_id')
        .eq('id', referenteId)
        .single();

      if (!referenteProfile?.azienda_id) {
        console.log('[usePasseggeriByReferente] Referente senza azienda_id');
        return [];
      }

      // Query passeggeri: tutti i passeggeri dell'azienda del referente
      const { data, error } = await supabase
        .from('passeggeri')
        .select('*')
        .eq('azienda_id', referenteProfile.azienda_id)
        .eq('tipo', 'rubrica')
        .order('nome_cognome', { ascending: true });

      if (error) {
        console.error('[usePasseggeriByReferente] Error fetching passeggeri:', error);
        throw error;
      }

      console.log(`[usePasseggeriByReferente] Found ${data?.length || 0} passengers for azienda ${referenteProfile.azienda_id}`);
      return data as Passeggero[];
    },
    enabled: !!referenteId,
  });
}

export function useAllPasseggeriByReferente() {
  return useQuery({
    queryKey: ['all-passeggeri'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passeggeri')
        .select('*')
        .eq('tipo', 'rubrica')
        .order('nome_cognome', { ascending: true });

      if (error) {
        console.error('Error fetching all passeggeri:', error);
        throw error;
      }

      // Group by created_by_referente_id
      const passeggeriByReferente = data.reduce((acc, passeggero) => {
        if (passeggero.created_by_referente_id) {
          if (!acc[passeggero.created_by_referente_id]) {
            acc[passeggero.created_by_referente_id] = [];
          }
          acc[passeggero.created_by_referente_id].push(passeggero);
        }
        return acc;
      }, {} as Record<string, Passeggero[]>);

      return passeggeriByReferente;
    },
  });
}
