import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Passeggero {
  id: string;
  nome_cognome: string;
  nome?: string;
  cognome?: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  localita?: string;
  azienda_id: string;
  referente_id?: string;
  created_at: string;
}

export function usePasseggeriByReferente(referenteId?: string) {
  return useQuery({
    queryKey: ['passeggeri', referenteId],
    queryFn: async () => {
      if (!referenteId) return [];
      
      const { data, error } = await supabase
        .from('passeggeri')
        .select('*')
        .eq('referente_id', referenteId);

      if (error) {
        console.error('Error fetching passeggeri:', error);
        throw error;
      }

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
        .select('*');

      if (error) {
        console.error('Error fetching all passeggeri:', error);
        throw error;
      }

      // Group by referente_id
      const passeggeriByReferente = data.reduce((acc, passeggero) => {
        if (passeggero.referente_id) {
          if (!acc[passeggero.referente_id]) {
            acc[passeggero.referente_id] = [];
          }
          acc[passeggero.referente_id].push(passeggero);
        }
        return acc;
      }, {} as Record<string, Passeggero[]>);

      return passeggeriByReferente;
    },
  });
}