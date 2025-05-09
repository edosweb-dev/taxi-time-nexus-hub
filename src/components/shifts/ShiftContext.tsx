
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Shift, ShiftFormData, ShiftContextType } from './types';
import { fetchShifts } from './shiftApi';
import { useShiftMutations } from './shiftMutations';

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  // Query for shifts
  const { data: shifts = [], isLoading, isError } = useQuery({
    queryKey: ['shifts', dateRange.start, dateRange.end, user?.id],
    queryFn: () => fetchShifts({
      start: dateRange.start,
      end: dateRange.end,
      isAdminOrSocio,
      userId: user?.id
    }),
    enabled: !!user,
  });

  // Load shifts for a specific date range
  const loadShifts = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);

  const { createShiftMutation, updateShiftMutation, deleteShiftMutation } = useShiftMutations(user?.id);

  // Helper functions to expose mutations
  const createShift = async (data: ShiftFormData) => {
    try {
      await createShiftMutation.mutateAsync(data);
      return true;
    } catch (error) {
      // L'errore è già gestito nella mutation
      return false;
    }
  };

  const updateShift = async (id: string, data: ShiftFormData) => {
    try {
      await updateShiftMutation.mutateAsync({ id, data });
      return true;
    } catch (error) {
      // L'errore è già gestito nella mutation
      return false;
    }
  };

  const deleteShift = async (id: string) => {
    try {
      await deleteShiftMutation.mutateAsync(id);
      return true;
    } catch (error) {
      // L'errore è già gestito nella mutation
      return false;
    }
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

// Re-export types for convenience
export * from './types';
