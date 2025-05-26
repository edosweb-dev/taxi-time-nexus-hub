
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Passeggero } from '@/lib/types/servizi';
import { toast } from '@/components/ui/sonner';

export interface CreatePasseggeroData {
  nome_cognome: string;
  email?: string;
  telefono?: string;
  azienda_id: string;
  referente_id: string;
}

export const usePasseggeri = (azienda_id?: string, referente_id?: string) => {
  const queryClient = useQueryClient();

  // Fetch passeggeri per azienda e referente
  const { data: passeggeri = [], isLoading } = useQuery({
    queryKey: ['passeggeri', azienda_id, referente_id],
    queryFn: async () => {
      if (!azienda_id || !referente_id) return [];
      
      const { data, error } = await supabase
        .from('passeggeri')
        .select('*')
        .eq('azienda_id', azienda_id)
        .eq('referente_id', referente_id)
        .order('nome_cognome');

      if (error) {
        console.error('Error fetching passeggeri:', error);
        throw error;
      }

      return data as Passeggero[];
    },
    enabled: !!azienda_id && !!referente_id,
  });

  // Crea nuovo passeggero
  const createPasseggero = useMutation({
    mutationFn: async (data: CreatePasseggeroData) => {
      const { data: passeggero, error } = await supabase
        .from('passeggeri')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating passeggero:', error);
        throw error;
      }

      return passeggero as Passeggero;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passeggeri'] });
      toast.success('Passeggero creato con successo');
    },
    onError: (error: any) => {
      console.error('Error creating passeggero:', error);
      toast.error(`Errore nella creazione del passeggero: ${error.message}`);
    },
  });

  return {
    passeggeri,
    isLoading,
    createPasseggero: createPasseggero.mutate,
    isCreating: createPasseggero.isPending,
  };
};
