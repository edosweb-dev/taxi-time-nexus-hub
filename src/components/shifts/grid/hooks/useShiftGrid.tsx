import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { useShifts, Shift } from '../../ShiftContext';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay 
} from 'date-fns';

export interface ShiftGridData {
  user: Profile;
  shifts: Map<string, Shift[]>; // key: YYYY-MM-DD, value: shifts for that day
}

export const useShiftGrid = (currentMonth: Date, selectedUserIds: string[] = []) => {
  const { shifts, isLoading: shiftsLoading } = useShifts();
  const [selectedCell, setSelectedCell] = useState<{ userId: string; date: string } | null>(null);
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);

  // Get all employees (exclude clients)
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees-for-shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'socio', 'dipendente'])
        .order('first_name', { ascending: true });

      if (error) throw error;
      return data as Profile[];
    }
  });

  // Filter employees if specific users are selected
  const filteredEmployees = useMemo(() => {
    if (selectedUserIds.length === 0) return employees;
    return employees.filter(emp => selectedUserIds.includes(emp.id));
  }, [employees, selectedUserIds]);

  // Get days of the month
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Organize shifts by user and date
  const gridData = useMemo((): ShiftGridData[] => {
    return filteredEmployees.map(user => {
      const userShifts = shifts.filter(shift => shift.user_id === user.id);
      const shiftsByDate = new Map<string, Shift[]>();
      
      userShifts.forEach(shift => {
        const dateKey = format(new Date(shift.shift_date), 'yyyy-MM-dd');
        if (!shiftsByDate.has(dateKey)) {
          shiftsByDate.set(dateKey, []);
        }
        shiftsByDate.get(dateKey)!.push(shift);
      });

      return {
        user,
        shifts: shiftsByDate
      };
    });
  }, [filteredEmployees, shifts]);

  const handleCellClick = (userId: string, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedCell({ userId, date: dateKey });
    setQuickDialogOpen(true);
  };

  const getShiftsForCell = (userId: string, date: Date): Shift[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const userData = gridData.find(data => data.user.id === userId);
    return userData?.shifts.get(dateKey) || [];
  };

  return {
    gridData,
    monthDays,
    selectedCell,
    setSelectedCell,
    quickDialogOpen,
    setQuickDialogOpen,
    isLoading: shiftsLoading || employeesLoading,
    handleCellClick,
    getShiftsForCell,
    currentMonth
  };
};