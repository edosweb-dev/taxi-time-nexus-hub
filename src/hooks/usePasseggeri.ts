import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Passeggero } from '@/lib/types/servizi';

export function usePasseggeri(aziendaId?: string, referenteId?: string) {
  return useQuery({
    queryKey: ['passeggeri', aziendaId, referenteId],
    queryFn: async () => {
      if (!aziendaId) return { passeggeri: [], isLoading: false };
      
      let query = supabase.from('passeggeri').select('*').eq('azienda_id', aziendaId);
      
      // Se c'è un referente_id, filtra per esso
      // Se non c'è referente_id, prendi tutti i passeggeri dell'azienda
      if (referenteId) {
        query = query.eq('referente_id', referenteId);
        console.log('[usePasseggeri] 🔍 Filtering by referente_id:', referenteId);
      } else {
        console.log('[usePasseggeri] ⚠️ No referente_id - fetching ALL passengers for azienda:', aziendaId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching passeggeri:', error);
        throw error;
      }

      console.log('[usePasseggeri] 📊 Query result:', {
        aziendaId,
        referenteId,
        totalPassengers: data?.length || 0,
        passengers: data?.map(p => ({
          id: p.id,
          nome: p.nome_cognome,
          referente_id: p.referente_id
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