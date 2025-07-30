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
  isSameMonth,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  addDays,
  addWeeks
} from 'date-fns';

export interface WeekData {
  startDate: Date;
  endDate: Date;
  days: DayShifts[];
}

export interface DayShifts {
  date: Date;
  shifts: Array<Shift & { user: Profile }>;
}

export const useShiftGrid = (currentMonth: Date, selectedUserIds: string[] = [], viewMode: "month" | "week" | "day" = "month") => {
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

  // Get all employees (exclude clients explicitly)
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['employees-for-shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'socio', 'dipendente'])
        .neq('role', 'cliente') // Explicit exclusion of clients
        .not('role', 'is', null) // Exclude null roles
        .order('role', { ascending: true })
        .order('first_name', { ascending: true });

      if (error) throw error;
      
      // Additional client-side filter as safety measure
      const filteredData = (data as Profile[]).filter(profile => 
        profile.role && ['admin', 'socio', 'dipendente'].includes(profile.role)
      );
      
      console.log('[useShiftGrid] Loaded employees:', filteredData.map(emp => `${emp.first_name} ${emp.last_name} (${emp.role})`));
      
      return filteredData;
    }
  });

  // Filter employees if specific users are selected
  const filteredEmployees = useMemo(() => {
    if (selectedUserIds.length === 0) return employees;
    return employees.filter(emp => selectedUserIds.includes(emp.id));
  }, [employees, selectedUserIds]);

  // Generate date range based on view mode
  const weekData = useMemo((): WeekData[] => {
    let startDate: Date;
    let endDate: Date;
    
    if (viewMode === "day") {
      // Single day
      startDate = currentMonth;
      endDate = currentMonth;
    } else if (viewMode === "week") {
      // Single week containing currentMonth
      startDate = startOfWeek(currentMonth, { weekStartsOn: 1 });
      endDate = endOfWeek(currentMonth, { weekStartsOn: 1 });
    } else {
      // Full month
      startDate = startOfMonth(currentMonth);
      endDate = endOfMonth(currentMonth);
    }
    
    const weeks: WeekData[] = [];
    let current = startDate;
    
    while (current <= endDate) {
      const weekStart = startOfWeek(current, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(current, { weekStartsOn: 1 });
      
      const days: DayShifts[] = [];
      for (let day = weekStart; day <= weekEnd; day = addDays(day, 1)) {
        if (viewMode === "day" && !isSameDay(day, currentMonth)) {
          continue; // Skip days that aren't the selected day
        }
        if (viewMode === "month" && !isSameMonth(day, currentMonth)) {
          continue; // Skip days outside current month for month view
        }
        
        days.push({
          date: day,
          shifts: []
        });
      }
      
      if (days.length > 0) {
        weeks.push({
          startDate: weekStart,
          endDate: weekEnd,
          days
        });
      }
      
      if (viewMode === "day" || viewMode === "week") {
        break; // Only one iteration for day/week view
      }
      
      current = addWeeks(current, 1);
      if (current > endDate) break;
    }
    
    return weeks;
  }, [currentMonth, viewMode]);

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
    // Non fare nulla - il calendario non permette più di inserire turni
    return;
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