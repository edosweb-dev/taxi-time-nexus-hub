import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { useShifts, Shift } from '../../ShiftContext';
import { ShiftType, HalfDayType } from '../../types';
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
  const { shifts, isLoading: shiftsLoading, createShift, loadShifts } = useShifts();
  const [selectedCell, setSelectedCell] = useState<{ userId: string; date: string } | null>(null);
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);

  console.log('[useShiftGrid] Current month:', format(currentMonth, 'yyyy-MM-dd'));
  console.log('[useShiftGrid] Received shifts:', shifts);
  console.log('[useShiftGrid] Selected user IDs:', selectedUserIds);

  // Load shifts for the current month when it changes
  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    console.log('[useShiftGrid] Loading shifts for range:', format(start, 'yyyy-MM-dd'), 'to', format(end, 'yyyy-MM-dd'));
    loadShifts(start, end);
  }, [currentMonth, loadShifts]);

  // Quick Insert State
  const [quickInsertMode, setQuickInsertMode] = useState({
    shiftType: null as ShiftType | null,
    employee: null as Profile | null,
    halfDayType: 'morning' as HalfDayType,
    startTime: '09:00',
    endTime: '17:00'
  });

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
    console.log('[useShiftGrid] Processing shifts:', shifts);
    console.log('[useShiftGrid] Filtered employees:', filteredEmployees);
    
    const shiftsMap = new Map<string, Array<Shift & { user: Profile }>>();
    
    shifts.forEach(shift => {
      const user = filteredEmployees.find(emp => emp.id === shift.user_id);
      console.log('[useShiftGrid] Processing shift:', shift, 'found user:', user);
      if (user) {
        const dateKey = format(new Date(shift.shift_date), 'yyyy-MM-dd');
        console.log('[useShiftGrid] Adding shift to date:', dateKey);
        if (!shiftsMap.has(dateKey)) {
          shiftsMap.set(dateKey, []);
        }
        // Use color from shift data (user_color) if available, otherwise from user profile
        const userWithColor = {
          ...user,
          color: shift.user_color || user.color || '#3B82F6'
        };
        shiftsMap.get(dateKey)!.push({ ...shift, user: userWithColor });
      }
    });

    console.log('[useShiftGrid] Final shiftsMap:', shiftsMap);
    return shiftsMap;
  }, [shifts, filteredEmployees]);

  const handleCellClick = async (date: Date, isDoubleClick = false) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    
    // Se è doppio click, apri sempre il dialogo completo
    if (isDoubleClick) {
      setSelectedCell({ userId: '', date: dateKey });
      setQuickDialogOpen(true);
      return;
    }

    // Se c'è un turno selezionato e un dipendente, inserisci direttamente
    if (quickInsertMode.shiftType && quickInsertMode.employee) {
      try {
        const shiftData = {
          user_id: quickInsertMode.employee.id,
          shift_date: date,
          shift_type: quickInsertMode.shiftType,
          start_time: quickInsertMode.shiftType === 'specific_hours' ? quickInsertMode.startTime : undefined,
          end_time: quickInsertMode.shiftType === 'specific_hours' ? quickInsertMode.endTime : undefined,
          half_day_type: quickInsertMode.shiftType === 'half_day' ? quickInsertMode.halfDayType : undefined,
        };

        await createShift(shiftData);
      } catch (error) {
        console.error('Error creating quick shift:', error);
      }
    } else {
      // Altrimenti, apri il dialogo
      setSelectedCell({ userId: '', date: dateKey });
      setQuickDialogOpen(true);
    }
  };

  const getShiftsForDate = (date: Date): Array<Shift & { user: Profile }> => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return shiftsByDate.get(dateKey) || [];
  };

  // Quick Insert Functions
  const setQuickShiftType = (type: ShiftType | null) => {
    setQuickInsertMode(prev => ({ ...prev, shiftType: type }));
  };

  const setQuickEmployee = (employee: Profile | null) => {
    setQuickInsertMode(prev => ({ ...prev, employee }));
  };

  const setQuickHalfDayType = (type: HalfDayType) => {
    setQuickInsertMode(prev => ({ ...prev, halfDayType: type }));
  };

  const setQuickStartTime = (time: string) => {
    setQuickInsertMode(prev => ({ ...prev, startTime: time }));
  };

  const setQuickEndTime = (time: string) => {
    setQuickInsertMode(prev => ({ ...prev, endTime: time }));
  };

  const clearQuickInsert = () => {
    setQuickInsertMode({
      shiftType: null,
      employee: null,
      halfDayType: 'morning',
      startTime: '09:00',
      endTime: '17:00'
    });
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
    employees: filteredEmployees,
    // Quick Insert State & Functions
    quickInsertMode,
    setQuickShiftType,
    setQuickEmployee,
    setQuickHalfDayType,
    setQuickStartTime,
    setQuickEndTime,
    clearQuickInsert
  };
};