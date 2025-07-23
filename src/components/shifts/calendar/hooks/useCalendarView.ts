
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
  format,
  isBefore,
  isToday
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '../../types';
import { useShifts } from '../../ShiftContext';

export function useCalendarView(
  currentMonth: Date, 
  onMonthChange: (date: Date) => void,
  selectedUserIds?: string[]
) {
  const { shifts, isLoading, loadShifts, setSelectedShift, setUserFilter, deleteShift } = useShifts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShiftUserId, setSelectedShiftUserId] = useState<string | null>(null);
  const [selectedShift, setSelectedShiftForEdit] = useState<Shift | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "day" | "month">("week");

  // Apply the user filter if provided
  useEffect(() => {
    // For now, we'll convert the array to a single user (first selected) or null
    // This maintains backward compatibility while allowing for future enhancement
    const firstUserId = selectedUserIds && selectedUserIds.length > 0 ? selectedUserIds[0] : null;
    setUserFilter(firstUserId);
  }, [selectedUserIds, setUserFilter]);

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
  useEffect(() => {
    loadShifts(viewStart, viewEnd);
  }, [viewStart, viewEnd, loadShifts]);

  const goToPreviousPeriod = () => {
    if (viewMode === "day") {
      onMonthChange(subDays(currentMonth, 1));
    } else if (viewMode === "week") {
      onMonthChange(subDays(currentMonth, 7));
    } else {
      onMonthChange(subMonths(currentMonth, 1));
    }
  };

  const goToNextPeriod = () => {
    if (viewMode === "day") {
      onMonthChange(addDays(currentMonth, 1));
    } else if (viewMode === "week") {
      onMonthChange(addDays(currentMonth, 7));
    } else {
      onMonthChange(addMonths(currentMonth, 1));
    }
  };
  
  const goToToday = () => onMonthChange(new Date());

  const handleCellClick = (day: Date, userId: string | null = null) => {
    setSelectedDate(day);
    setSelectedShiftUserId(userId);
    
    // Get shifts for the selected day
    const dayShifts = shifts.filter(shift => {
      const shiftDate = parseISO(shift.shift_date);
      return isSameDay(shiftDate, day);
    });

    // Logic for determining which dialog to open
    const isPastOrToday = isBefore(day, new Date()) || isToday(day);
    
    if (isPastOrToday && dayShifts.length > 0) {
      // Past/today with existing shifts: show details
      setIsDetailsDialogOpen(true);
    } else if (!isPastOrToday) {
      // Future date: allow adding shifts
      setIsAddDialogOpen(true);
    } else {
      // Past date with no shifts: show details dialog anyway (will show "no shifts" message)
      setIsDetailsDialogOpen(true);
    }
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShiftForEdit(shift);
    setIsEditDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await deleteShift(shiftId);
      setIsDetailsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
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

  // Get shifts for selected date
  const selectedDateShifts = useMemo(() => {
    if (!selectedDate) return [];
    return shifts.filter(shift => {
      const shiftDate = parseISO(shift.shift_date);
      return isSameDay(shiftDate, selectedDate);
    });
  }, [shifts, selectedDate]);

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
    isDetailsDialogOpen,
    setIsDetailsDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedDate,
    selectedShiftUserId,
    selectedShift,
    selectedDateShifts,
    handleCellClick,
    handleEditShift,
    handleDeleteShift,
    formatViewPeriod,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
    getShiftPosition,
    setSelectedShift
  };
}
