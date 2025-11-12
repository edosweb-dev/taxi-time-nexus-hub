import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Passeggero } from '@/lib/types/servizi';

export function usePasseggeri(aziendaId?: string) {
  return useQuery({
    queryKey: ['passeggeri', aziendaId],
    queryFn: async () => {
      if (!aziendaId) return { passeggeri: [], isLoading: false };
      
      let query = supabase
        .from('passeggeri')
        .select('*')
        .eq('azienda_id', aziendaId)
        .eq('tipo', 'rubrica');

      console.log('[usePasseggeri] 📊 Fetching ALL passengers for azienda:', aziendaId);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching passeggeri:', error);
        throw error;
      }

      console.log('[usePasseggeri] 📊 Query result:', {
        aziendaId,
        totalPassengers: data?.length || 0,
        passengers: data?.map(p => ({
          id: p.id,
          nome: p.nome_cognome
        }))
      });
      return { passeggeri: data as Passeggero[], isLoading: false };
    },
    enabled: !!aziendaId, // Enabled only if azienda_id is provided
    select: (data) => ({
      passeggeri: data?.passeggeri || [],
      isLoading: false
    })
  });
}