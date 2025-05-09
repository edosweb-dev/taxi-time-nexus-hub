
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns';

export type ShiftType = 'specific_hours' | 'full_day' | 'half_day' | 'sick_leave' | 'unavailable';
export type HalfDayType = 'morning' | 'afternoon' | null;

export interface Shift {
  id: string;
  user_id: string;
  shift_date: string;
  shift_type: ShiftType;
  start_time: string | null;
  end_time: string | null;
  half_day_type: HalfDayType;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  user_first_name?: string | null;
  user_last_name?: string | null;
}

export interface ShiftFormData {
  user_id: string;
  shift_date: Date;
  shift_type: ShiftType;
  start_time?: string | null;
  end_time?: string | null;
  half_day_type?: HalfDayType;
  start_date?: Date | null;
  end_date?: Date | null;
  notes?: string | null;
}

interface ShiftContextType {
  shifts: Shift[];
  isLoading: boolean;
  isError: boolean;
  createShift: (data: ShiftFormData) => Promise<void>;
  updateShift: (id: string, data: ShiftFormData) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  loadShifts: (startDate: Date, endDate: Date) => void;
  setSelectedShift: (shift: Shift | null) => void;
  selectedShift: Shift | null;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  // Function to fetch shifts
  const fetchShifts = async ({ start, end }: { start: Date; end: Date }) => {
    try {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name
          )
        `)
        .gte('shift_date', format(start, 'yyyy-MM-dd'))
        .lte('shift_date', format(end, 'yyyy-MM-dd'));

      // If not admin/socio, only fetch own shifts
      if (!isAdminOrSocio && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include user_first_name and user_last_name
      return data.map((shift) => ({
        ...shift,
        user_first_name: shift.profiles?.first_name,
        user_last_name: shift.profiles?.last_name,
      })) as Shift[];
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast.error('Errore nel caricamento dei turni');
      return [];
    }
  };

  // Query for shifts
  const { data: shifts = [], isLoading, isError } = useQuery({
    queryKey: ['shifts', dateRange.start, dateRange.end, user?.id],
    queryFn: () => fetchShifts(dateRange),
    enabled: !!user,
  });

  // Load shifts for a specific date range
  const loadShifts = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);

  // Mutation for creating a shift
  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftFormData) => {
      if (!user) throw new Error('Utente non autenticato');

      const shiftData = {
        user_id: data.user_id,
        shift_date: format(data.shift_date, 'yyyy-MM-dd'),
        shift_type: data.shift_type,
        start_time: data.start_time,
        end_time: data.end_time,
        half_day_type: data.half_day_type || null,
        start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd') : null,
        end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
        notes: data.notes || null,
        created_by: user.id,
        updated_by: user.id
      };

      const { data: result, error } = await supabase
        .from('shifts')
        .insert(shiftData)
        .select();

      if (error) throw error;
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno creato con successo');
    },
    onError: (error) => {
      console.error('Error creating shift:', error);
      toast.error('Errore nella creazione del turno');
    },
  });

  // Mutation for updating a shift
  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ShiftFormData }) => {
      if (!user) throw new Error('Utente non autenticato');

      const shiftData = {
        user_id: data.user_id,
        shift_date: format(data.shift_date, 'yyyy-MM-dd'),
        shift_type: data.shift_type,
        start_time: data.start_time,
        end_time: data.end_time,
        half_day_type: data.half_day_type || null,
        start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd') : null,
        end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
        notes: data.notes || null,
        updated_by: user.id
      };

      const { data: result, error } = await supabase
        .from('shifts')
        .update(shiftData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno aggiornato con successo');
    },
    onError: (error) => {
      console.error('Error updating shift:', error);
      toast.error('Errore nell\'aggiornamento del turno');
    },
  });

  // Mutation for deleting a shift
  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno eliminato con successo');
    },
    onError: (error) => {
      console.error('Error deleting shift:', error);
      toast.error('Errore nell\'eliminazione del turno');
    },
  });

  // Helper functions to expose mutations
  const createShift = async (data: ShiftFormData) => {
    await createShiftMutation.mutateAsync(data);
  };

  const updateShift = async (id: string, data: ShiftFormData) => {
    await updateShiftMutation.mutateAsync({ id, data });
  };

  const deleteShift = async (id: string) => {
    await deleteShiftMutation.mutateAsync(id);
  };

  const value = {
    shifts,
    isLoading,
    isError,
    createShift,
    updateShift,
    deleteShift,
    loadShifts,
    selectedShift,
    setSelectedShift
  };

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
}

export function useShifts() {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
}
