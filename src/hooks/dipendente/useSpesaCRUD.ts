import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SpesaFormData {
  dataSpesa: Date;
  importo: number;
  causale: string;
  note?: string;
}

export function useSpesaCRUD() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const createSpesa = useMutation({
    mutationFn: async (data: SpesaFormData) => {
      if (!user) throw new Error('Utente non autenticato');

      const { data: spesa, error } = await supabase
        .from('spese_dipendenti')
        .insert({
          user_id: user.id,
          registered_by: user.id,
          data_spesa: data.dataSpesa.toISOString().split('T')[0],
          importo: data.importo,
          causale: data.causale,
          note: data.note || null,
          stato: 'in_attesa'
        })
        .select()
        .single();

      if (error) throw error;
      return spesa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spese-dipendente'] });
      toast({
        title: 'Spesa inviata! 💳',
        description: 'La tua spesa è stata inviata per approvazione'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile creare la spesa',
        variant: 'destructive'
      });
    }
  });

  const updateSpesa = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SpesaFormData }) => {
      if (!user) throw new Error('Utente non autenticato');

      // Verifica che la spesa sia modificabile
      const { data: existing, error: checkError } = await supabase
        .from('spese_dipendenti')
        .select('stato, user_id')
        .eq('id', id)
        .single();

      if (checkError) throw checkError;
      if (existing.user_id !== user.id) {
        throw new Error('Non hai i permessi per modificare questa spesa');
      }
      if (existing.stato !== 'in_attesa') {
        throw new Error('Puoi modificare solo spese in attesa di approvazione');
      }

      const { data: spesa, error } = await supabase
        .from('spese_dipendenti')
        .update({
          data_spesa: data.dataSpesa.toISOString().split('T')[0],
          importo: data.importo,
          causale: data.causale,
          note: data.note || null
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return spesa;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spese-dipendente'] });
      toast({
        title: 'Spesa modificata! ✅',
        description: 'Le modifiche sono state salvate con successo'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile aggiornare la spesa',
        variant: 'destructive'
      });
    }
  });

  const deleteSpesa = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Utente non autenticato');

      // Verifica che la spesa sia eliminabile
      const { data: existing, error: checkError } = await supabase
        .from('spese_dipendenti')
        .select('stato, user_id')
        .eq('id', id)
        .single();

      if (checkError) throw checkError;
      if (existing.user_id !== user.id) {
        throw new Error('Non hai i permessi per eliminare questa spesa');
      }
      if (existing.stato !== 'in_attesa') {
        throw new Error('Puoi eliminare solo spese in attesa di approvazione');
      }

      const { error } = await supabase
        .from('spese_dipendenti')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spese-dipendente'] });
      toast({
        title: 'Spesa eliminata',
        description: 'La spesa è stata eliminata con successo'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile eliminare la spesa',
        variant: 'destructive'
      });
    }
  });

  return {
    createSpesa,
    updateSpesa,
    deleteSpesa
  };
}
