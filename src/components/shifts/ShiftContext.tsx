
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Shift, ShiftFormData, ShiftContextType } from './types';
import { fetchShifts } from './shiftApi';
import { useShiftMutations } from './shiftMutations';
import { toast } from '@/components/ui/sonner';

// Validation function moved from shiftMutations.ts
const validateShiftRule = (
  shifts: Shift[], 
  newShift: ShiftFormData, 
  editingShiftId?: string
): { isValid: boolean; errorMessage?: string } => {
  // Format the date of the new shift for comparison
  const newShiftDate = newShift.shift_date.toISOString().split('T')[0];
  
  // Filter user shifts on the same date (excluding the one being edited if it exists)
  const userShiftsOnSameDate = shifts.filter(shift => 
    shift.user_id === newShift.user_id && 
    shift.shift_date === newShiftDate &&
    (!editingShiftId || shift.id !== editingShiftId)
  );
  
  // If there are no existing shifts for that date, it's always valid
  if (userShiftsOnSameDate.length === 0) {
    return { isValid: true };
  }

  // Check the rule: more than one shift is allowed only if all are "specific_hours" type
  if (newShift.shift_type === 'specific_hours') {
    // Verify that all existing shifts are "specific_hours" type
    const allSpecificHours = userShiftsOnSameDate.every(shift => shift.shift_type === 'specific_hours');
    if (allSpecificHours) {
      return { isValid: true };
    }
  }

  // In all other cases, it's not allowed to add another shift
  return { 
    isValid: false, 
    errorMessage: "È possibile inserire un solo turno per giornata, a meno che entrambi i turni abbiano un orario specifico."
  };
};

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const queryClient = useQueryClient();

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

  // Helper functions to expose mutations - with validation logic before mutation
  const createShift = async (data: ShiftFormData) => {
    try {
      // Get existing shifts from query cache
      const currentShifts = queryClient.getQueryData<Shift[]>(['shifts']) || [];
      
      // Validate if the shift can be inserted
      const validation = validateShiftRule(currentShifts, data);
      
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        throw new Error(validation.errorMessage);
      }
      
      await createShiftMutation.mutateAsync(data);
      // Return removed to match Promise<void> return type
    } catch (error) {
      // L'errore è già gestito nella mutation
    }
  };

  const updateShift = async (id: string, data: ShiftFormData) => {
    try {
      // Get existing shifts from query cache
      const currentShifts = queryClient.getQueryData<Shift[]>(['shifts']) || [];
      
      // Validate if the shift can be updated
      const validation = validateShiftRule(currentShifts, data, id);
      
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        throw new Error(validation.errorMessage);
      }
      
      await updateShiftMutation.mutateAsync({ id, data });
      // Return removed to match Promise<void> return type
    } catch (error) {
      // L'errore è già gestito nella mutation
    }
  };

  const deleteShift = async (id: string) => {
    try {
      await deleteShiftMutation.mutateAsync(id);
      // Return removed to match Promise<void> return type
    } catch (error) {
      // L'errore è già gestito nella mutation
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
