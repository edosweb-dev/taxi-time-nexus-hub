
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Shift, ShiftFormData, ShiftContextType } from './types';
import { fetchShifts } from './shiftApi';
import { useShiftMutations } from './shiftMutations';
import { toast } from '@/components/ui/sonner';


const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [filteredUserId, setFilteredUserId] = useState<string | null>(null);
  const [filteredDate, setFilteredDate] = useState<Date | null>(null);
  const queryClient = useQueryClient();

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  // Query for shifts
  const { data: shifts = [], isLoading, isError } = useQuery({
    queryKey: ['shifts', dateRange.start, dateRange.end, user?.id, filteredUserId, filteredDate],
    queryFn: () => fetchShifts({
      start: dateRange.start,
      end: dateRange.end,
      isAdminOrSocio,
      userId: filteredUserId || (isAdminOrSocio ? undefined : user?.id)
    }),
    enabled: !!user,
  });

  // Load shifts for a specific date range and filters
  const loadShifts = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);

  // Set filter for specific user
  const setUserFilter = useCallback((userId: string | null) => {
    setFilteredUserId(userId);
  }, []);

  // Set filter for specific date
  const setDateFilter = useCallback((date: Date | null) => {
    setFilteredDate(date);
  }, []);

  const { createShiftMutation, updateShiftMutation, deleteShiftMutation } = useShiftMutations(user?.id);

  // Helper functions to expose mutations
  const createShift = async (data: ShiftFormData) => {
    try {
      await createShiftMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error in createShift:', error);
      throw error;
    }
  };

  const updateShift = async (id: string, data: ShiftFormData) => {
    try {
      await updateShiftMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Error in updateShift:', error);
      throw error;
    }
  };

  const deleteShift = async (id: string) => {
    try {
      await deleteShiftMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error in deleteShift:', error);
      throw error;
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
    setSelectedShift,
    filteredUserId,
    setUserFilter,
    filteredDate,
    setDateFilter
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
