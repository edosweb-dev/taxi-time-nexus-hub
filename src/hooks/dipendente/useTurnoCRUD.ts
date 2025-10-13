import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, eachDayOfInterval } from 'date-fns';

export interface TurnoFormData {
  data: Date;
  tipo: 'full_day' | 'half_day' | 'specific_hours' | 'sick_leave' | 'unavailable' | 'extra';
  oraInizio?: string;
  oraFine?: string;
  mezzaGiornata?: 'morning' | 'afternoon';
  dataInizio?: Date;
  dataFine?: Date;
  note?: string;
}

export function useTurnoCRUD() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const createTurno = useMutation({
    mutationFn: async (data: TurnoFormData) => {
      if (!profile?.id) throw new Error('User not authenticated');

      let turniDaCreare: any[] = [];

      // Multi-day shifts for sick_leave, unavailable, extra
      if (data.dataInizio && data.dataFine) {
        const giorni = eachDayOfInterval({
          start: data.dataInizio,
          end: data.dataFine,
        });

        turniDaCreare = giorni.map(giorno => ({
          user_id: profile.id,
          shift_date: format(giorno, 'yyyy-MM-dd'),
          shift_type: data.tipo,
          start_time: data.oraInizio || null,
          end_time: data.oraFine || null,
          half_day_type: data.mezzaGiornata || null,
          notes: data.note || null,
          created_by: profile.id,
          updated_by: profile.id,
          start_date: format(data.dataInizio, 'yyyy-MM-dd'),
          end_date: format(data.dataFine, 'yyyy-MM-dd'),
        }));
      } else {
        turniDaCreare = [{
          user_id: profile.id,
          shift_date: format(data.data, 'yyyy-MM-dd'),
          shift_type: data.tipo,
          start_time: data.oraInizio || null,
          end_time: data.oraFine || null,
          half_day_type: data.mezzaGiornata || null,
          notes: data.note || null,
          created_by: profile.id,
          updated_by: profile.id,
        }];
      }

      const { data: turni, error } = await supabase
        .from('shifts')
        .insert(turniDaCreare)
        .select();

      if (error) throw error;
      return turni;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turni-mese'] });
      queryClient.invalidateQueries({ queryKey: ['turni-settimana'] });
      queryClient.invalidateQueries({ queryKey: ['servizi-oggi'] });
      toast.success('Turno creato! ✅');
    },
    onError: (error: any) => {
      console.error('Create turno error:', error);
      toast.error(error.message || 'Errore durante la creazione del turno');
    },
  });

  const updateTurno = useMutation({
    mutationFn: async ({ turnoId, data }: { turnoId: string; data: TurnoFormData }) => {
      if (!profile?.id) throw new Error('User not authenticated');

      const { data: turno, error } = await supabase
        .from('shifts')
        .update({
          shift_date: format(data.data, 'yyyy-MM-dd'),
          shift_type: data.tipo,
          start_time: data.oraInizio || null,
          end_time: data.oraFine || null,
          half_day_type: data.mezzaGiornata || null,
          notes: data.note || null,
          updated_by: profile.id,
        })
        .eq('id', turnoId)
        .eq('user_id', profile.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!turno) throw new Error('Turno non trovato o non autorizzato');
      return turno;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turni-mese'] });
      queryClient.invalidateQueries({ queryKey: ['turni-settimana'] });
      toast.success('Turno aggiornato! ✅');
    },
    onError: (error: any) => {
      console.error('Update turno error:', error);
      toast.error(error.message || 'Errore durante l\'aggiornamento del turno');
    },
  });

  const deleteTurno = useMutation({
    mutationFn: async (turnoId: string) => {
      if (!profile?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', turnoId)
        .eq('user_id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turni-mese'] });
      queryClient.invalidateQueries({ queryKey: ['turni-settimana'] });
      toast.success('Turno eliminato');
    },
    onError: (error: any) => {
      console.error('Delete turno error:', error);
      toast.error(error.message || 'Errore durante l\'eliminazione del turno');
    },
  });

  return {
    createTurno: createTurno.mutateAsync,
    updateTurno: updateTurno.mutateAsync,
    deleteTurno: deleteTurno.mutateAsync,
    isCreating: createTurno.isPending,
    isUpdating: updateTurno.isPending,
    isDeleting: deleteTurno.isPending,
  };
}
