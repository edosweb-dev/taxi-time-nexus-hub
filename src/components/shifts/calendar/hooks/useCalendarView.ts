
import { useState, useMemo, useEffect } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  eachDayOfInterval,
  subMonths, 
  addMonths,
  subDays,
  addDays,
  parseISO,
  isSameDay,
  format
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '../../types';
import { useShifts } from '../../ShiftContext';

export function useCalendarView(
  currentMonth: Date, 
  onMonthChange: (date: Date) => void,
  selectedUserId?: string | null
) {
  const { shifts, isLoading, loadShifts, setSelectedShift, setUserFilter } = useShifts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShiftUserId, setSelectedShiftUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "day" | "month">("week");

  // Apply the user filter if provided
  useEffect(() => {
    setUserFilter(selectedUserId || null);
  }, [selectedUserId, setUserFilter]);

  // Get days of current view based on viewMode
  const viewStart = useMemo(() => {
    if (viewMode === "day") return currentMonth;
    if (viewMode === "week") return startOfWeek(currentMonth, { weekStartsOn: 1 }); // Monday
    return startOfMonth(currentMonth);
  }, [currentMonth, viewMode]);
  
  const viewEnd = useMemo(() => {
    if (viewMode === "day") return currentMonth;
    if (viewMode === "week") return endOfWeek(currentMonth, { weekStartsOn: 1 }); // Sunday
    return endOfMonth(currentMonth);
  }, [currentMonth, viewMode]);
  
  // Generate days for the current view
  const daysInView = useMemo(() => 
    eachDayOfInterval({ start: viewStart, end: viewEnd }),
    [viewStart, viewEnd]
  );
  
  // Define time slots (hours) for day and week views
  const hours = useMemo(() => Array.from({ length: 17 }, (_, i) => i + 6), []);

  // Load shifts when date range changes
  useMemo(() => {
    loadShifts(viewStart, viewEnd);
  }, [viewStart, viewEnd, loadShifts]);

  const goToPreviousPeriod = () => {
    if (viewMode === "day") {
      // Move one day back
      onMonthChange(subDays(currentMonth, 1));
    } else if (viewMode === "week") {
      // Move one week back
      onMonthChange(subDays(currentMonth, 7));
    } else {
      // Move one month back
      onMonthChange(subMonths(currentMonth, 1));
    }
  };

  const goToNextPeriod = () => {
    if (viewMode === "day") {
      // Move one day forward
      onMonthChange(addDays(currentMonth, 1));
    } else if (viewMode === "week") {
      // Move one week forward
      onMonthChange(addDays(currentMonth, 7));
    } else {
      // Move one month forward
      onMonthChange(addMonths(currentMonth, 1));
    }
  };
  
  const goToToday = () => onMonthChange(new Date());

  const handleCellClick = (day: Date, userId: string | null = null) => {
    setSelectedDate(day);
    setSelectedShiftUserId(userId);
    setIsAddDialogOpen(true);
  };

  // Helper to format the current view period
  const formatViewPeriod = () => {
    if (viewMode === "day") {
      return format(currentMonth, "EEEE d MMMM yyyy", { locale: it });
    } else if (viewMode === "week") {
      const start = format(viewStart, "d MMMM", { locale: it });
      const end = format(viewEnd, "d MMMM yyyy", { locale: it });
      return `${start} - ${end}`;
    } else {
      return format(currentMonth, "MMMM yyyy", { locale: it });
    }
  };

  // Filter shifts relevant to the current view
  const shiftsInView = useMemo(() => {
    return shifts.filter(shift => {
      const shiftDate = parseISO(shift.shift_date);
      return daysInView.some(day => isSameDay(shiftDate, day));
    });
  }, [shifts, daysInView]);

  // Position a shift in the calendar grid based on its time
  const getShiftPosition = (shift: Shift) => {
    // Default position is based on shift_type
    if (shift.shift_type === 'full_day') {
      return { top: 20, height: 40, spanRows: true };
    }
    
    if (shift.shift_type === 'half_day') {
      if (shift.half_day_type === 'morning') {
        return { top: 8 * 60, height: 4 * 60, spanRows: false };
      } else {
        return { top: 14 * 60, height: 4 * 60, spanRows: false };
      }
    }
    
    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
      const startParts = shift.start_time.split(':').map(Number);
      const endParts = shift.end_time.split(':').map(Number);
      
      const startHour = startParts[0] + (startParts[1] / 60);
      const endHour = endParts[0] + (endParts[1] / 60);
      
      const top = (startHour - 6) * 60; // 6 is the first hour in our view
      const height = (endHour - startHour) * 60;
      
      return { top, height, spanRows: false };
    }
    
    // Default for unavailable and sick leave
    return { top: 20, height: 40, spanRows: true };
  };

  return { 
    viewMode,
    setViewMode,
    viewStart,
    viewEnd,
    daysInView,
    hours,
    shiftsInView,
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedDate,
    selectedShiftUserId,
    handleCellClick,
    formatViewPeriod,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
    getShiftPosition,
    setSelectedShift
  };
}
