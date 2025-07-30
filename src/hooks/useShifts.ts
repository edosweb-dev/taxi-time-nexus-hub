import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shift, CreateShiftData, UpdateShiftData, ShiftFilters } from '@/types/shifts';
import { toast } from 'sonner';

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async (filters?: ShiftFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('shifts')
        .select('*')
        .order('shift_date', { ascending: true });

      if (filters?.user_ids?.length) {
        query = query.in('user_id', filters.user_ids);
      }

      if (filters?.start_date) {
        query = query.gte('shift_date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('shift_date', filters.end_date);
      }

      if (filters?.shift_types?.length) {
        query = query.in('shift_type', filters.shift_types);
      }

      const { data, error } = await query;

      if (error) throw error;

      setShifts(data || []);
    } catch (err: any) {
      console.error('Error fetching shifts:', err);
      setError(err.message);
      toast.error('Errore nel caricamento dei turni');
    } finally {
      setLoading(false);
    }
  }, []);

  const createShift = useCallback(async (shiftData: CreateShiftData) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          ...shiftData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setShifts(prev => [...prev, data]);
      toast.success('Turno creato con successo');
      return data;
    } catch (err: any) {
      console.error('Error creating shift:', err);
      toast.error('Errore nella creazione del turno');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShift = useCallback(async (shiftData: UpdateShiftData) => {
    try {
      setLoading(true);
      
      const { id, ...updateData } = shiftData;
      const { data, error } = await supabase
        .from('shifts')
        .update({
          ...updateData,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setShifts(prev => prev.map(shift => shift.id === id ? data : shift));
      toast.success('Turno aggiornato con successo');
      return data;
    } catch (err: any) {
      console.error('Error updating shift:', err);
      toast.error('Errore nell\'aggiornamento del turno');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteShift = useCallback(async (shiftId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;

      setShifts(prev => prev.filter(shift => shift.id !== shiftId));
      toast.success('Turno eliminato con successo');
    } catch (err: any) {
      console.error('Error deleting shift:', err);
      toast.error('Errore nell\'eliminazione del turno');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBatchShifts = useCallback(async (shiftsData: CreateShiftData[]) => {
    try {
      setLoading(true);
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      const shiftsToCreate = shiftsData.map(shift => ({
        ...shift,
        created_by: currentUser?.id,
        updated_by: currentUser?.id
      }));

      const { data, error } = await supabase
        .from('shifts')
        .insert(shiftsToCreate)
        .select();

      if (error) throw error;

      setShifts(prev => [...prev, ...(data || [])]);
      toast.success(`${data?.length || 0} turni creati con successo`);
      return data;
    } catch (err: any) {
      console.error('Error creating batch shifts:', err);
      toast.error('Errore nella creazione dei turni');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    shifts,
    loading,
    error,
    fetchShifts,
    createShift,
    updateShift,
    deleteShift,
    createBatchShifts
  };
}