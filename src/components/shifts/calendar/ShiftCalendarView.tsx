import { useState, useMemo, useEffect } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  format,
  parseISO,
  isSameDay,
  eachDayOfInterval,
  subMonths,
  addMonths
} from 'date-fns';
import { it } from 'date-fns/locale';
import { useShifts, Shift } from '../ShiftContext';
import { ShiftCalendarHeader } from './ShiftCalendarHeader';
import { ShiftCalendarGrid } from './ShiftCalendarGrid';
import { ShiftCalendarLegend } from './ShiftCalendarLegend';
import { ShiftCalendarMonthView } from './ShiftCalendarMonthView';
import { Card, CardContent } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUsers';
import { getUserColorClass } from '../filters/UserFilterDropdown';
import { AddShiftDialog } from '../AddShiftDialog';
import { useAuth } from '@/hooks/useAuth';

interface ShiftCalendarViewProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
  selectedUserId?: string | null;
}

export function ShiftCalendarView({ 
  currentMonth, 
  onMonthChange, 
  isAdminOrSocio,
  selectedUserId
}: ShiftCalendarViewProps) {
  const { shifts, isLoading, loadShifts, setSelectedShift, setUserFilter } = useShifts();
  const { users } = useUsers();
  const { user } = useAuth();
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
      onMonthChange(subMonths(currentMonth, 1/30)); // One day back
    } else if (viewMode === "week") {
      onMonthChange(subMonths(currentMonth, 1/4)); // One week back
    } else {
      onMonthChange(subMonths(currentMonth, 1)); // One month back
    }
  };

  const goToNextPeriod = () => {
    if (viewMode === "day") {
      onMonthChange(addMonths(currentMonth, 1/30)); // One day forward
    } else if (viewMode === "week") {
      onMonthChange(addMonths(currentMonth, 1/4)); // One week forward
    } else {
      onMonthChange(addMonths(currentMonth, 1)); // One month forward
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

  return (
    <div className="space-y-4">
      <ShiftCalendarHeader 
        currentDate={currentMonth}
        viewMode={viewMode}
        setViewMode={setViewMode}
        goToPreviousPeriod={goToPreviousPeriod}
        goToNextPeriod={goToNextPeriod}
        goToToday={goToToday}
        formatViewPeriod={formatViewPeriod}
      />
      
      <ShiftCalendarLegend />
      
      {viewMode === "month" ? (
        <ShiftCalendarMonthView 
          daysInView={daysInView}
          currentMonth={currentMonth}
          shifts={shifts}
          isAdminOrSocio={isAdminOrSocio}
          onCellClick={handleCellClick}
          onSelectShift={setSelectedShift}
          userId={user?.id}
        />
      ) : (
        <ShiftCalendarGrid
          viewMode={viewMode}
          daysInView={daysInView}
          hours={hours}
          shiftsInView={shiftsInView}
          getShiftPosition={getShiftPosition}
          onSelectShift={(shift) => {
            setSelectedShift(shift);
            setIsAddDialogOpen(true);
          }}
          onAddShift={(day) => handleCellClick(day, user?.id || null)}
        />
      )}
      
      {shiftsInView.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nessun turno programmato per questo periodo
          </CardContent>
        </Card>
      )}
      
      <AddShiftDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
        defaultDate={selectedDate}
        defaultUserId={selectedShiftUserId}
      />
    </div>
  );
}
