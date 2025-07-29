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
  isSameDay,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval
} from 'date-fns';

export interface WeekData {
  weekStart: Date;
  days: Date[];
}

export interface DayShifts {
  date: Date;
  shifts: Array<Shift & { user: Profile }>;
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

  // Get weeks of the month
  const weekData = useMemo((): WeekData[] => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }); // Monday start
    
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return {
        weekStart,
        days: daysInWeek
      };
    });
  }, [currentMonth]);

  // Organize shifts by date with user info
  const shiftsByDate = useMemo((): Map<string, Array<Shift & { user: Profile }>> => {
    const shiftsMap = new Map<string, Array<Shift & { user: Profile }>>();
    
    shifts.forEach(shift => {
      const user = filteredEmployees.find(emp => emp.id === shift.user_id);
      if (user) {
        const dateKey = format(new Date(shift.shift_date), 'yyyy-MM-dd');
        if (!shiftsMap.has(dateKey)) {
          shiftsMap.set(dateKey, []);
        }
        shiftsMap.get(dateKey)!.push({ ...shift, user });
      }
    });

    return shiftsMap;
  }, [shifts, filteredEmployees]);

  const handleCellClick = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedCell({ userId: '', date: dateKey }); // userId vuoto per indicare selezione di giorno
    setQuickDialogOpen(true);
  };

  const getShiftsForDate = (date: Date): Array<Shift & { user: Profile }> => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return shiftsByDate.get(dateKey) || [];
  };

  return {
    weekData,
    shiftsByDate,
    selectedCell,
    setSelectedCell,
    quickDialogOpen,
    setQuickDialogOpen,
    isLoading: shiftsLoading || employeesLoading,
    handleCellClick,
    getShiftsForDate,
    currentMonth,
    employees: filteredEmployees
  };
};