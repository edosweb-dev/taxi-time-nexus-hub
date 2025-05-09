
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
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
  const newShiftDate = format(newShift.shift_date, 'yyyy-MM-dd');
  
  console.log('Validating shift with date:', newShiftDate);
  console.log('User ID being validated:', newShift.user_id);
  console.log('Editing shift ID (if any):', editingShiftId);
  
  // Filter user shifts on the same date (excluding the one being edited if it exists)
  const userShiftsOnSameDate = shifts.filter(shift => {
    const isSameUser = shift.user_id === newShift.user_id;
    const isSameDate = shift.shift_date === newShiftDate;
    const isNotCurrentEdit = !editingShiftId || shift.id !== editingShiftId;
    
    console.log(`Shift ${shift.id}: isSameUser=${isSameUser}, isSameDate=${isSameDate}, isNotCurrentEdit=${isNotCurrentEdit}`);
    return isSameUser && isSameDate && isNotCurrentEdit;
  });
  
  console.log('User shifts on same date:', userShiftsOnSameDate);
  console.log('All shifts:', shifts);
  console.log('New shift type:', newShift.shift_type);
  
  // If there are no existing shifts for that date, it's always valid
  if (userShiftsOnSameDate.length === 0) {
    console.log('No shifts on this date, allowing new shift');
    return { isValid: true };
  }

  // Check the rule: more than one shift is allowed only if all are "specific_hours" type
  if (newShift.shift_type === 'specific_hours') {
    // Verify that all existing shifts are "specific_hours" type
    const allSpecificHours = userShiftsOnSameDate.every(shift => shift.shift_type === 'specific_hours');
    console.log('New shift is specific_hours, all existing shifts are specific_hours:', allSpecificHours);
    if (allSpecificHours) {
      return { isValid: true };
    }
  }

  // In all other cases, it's not allowed to add another shift
  console.log('Validation failed: user already has a non-specific_hours shift on this date');
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

  // Helper functions to expose mutations - with validation logic before mutation
  const createShift = async (data: ShiftFormData) => {
    try {
      console.log('Creating shift with data:', data);
      console.log('Current user ID:', user?.id);
      
      // Get all current shifts - this is important to check validation against all shifts
      const currentShifts = [...shifts]; // Make a copy of all current shifts
      console.log('Retrieved shifts for validation:', currentShifts);
      
      // Validate if the shift can be inserted
      const validation = validateShiftRule(currentShifts, data);
      
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        throw new Error(validation.errorMessage);
      }
      
      await createShiftMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error in createShift:', error);
      // Error is already handled in the mutation
      throw error; // Re-throw to propagate to UI
    }
  };

  const updateShift = async (id: string, data: ShiftFormData) => {
    try {
      console.log('Updating shift with ID:', id, 'Data:', data);
      
      // Get all current shifts - this is important to check validation against all shifts
      const currentShifts = [...shifts]; // Make a copy of all current shifts
      console.log('Retrieved shifts for validation on update:', currentShifts);
      
      // Validate if the shift can be updated
      const validation = validateShiftRule(currentShifts, data, id);
      
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        throw new Error(validation.errorMessage);
      }
      
      await updateShiftMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Error in updateShift:', error);
      // Error is already handled in the mutation
      throw error; // Re-throw to propagate to UI
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
