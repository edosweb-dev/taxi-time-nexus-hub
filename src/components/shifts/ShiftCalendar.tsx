
import { useState, useMemo } from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  parseISO,
  isWithinInterval,
  isSameDay
} from 'date-fns';
import { it } from 'date-fns/locale';
import { useShifts, Shift } from './ShiftContext';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { AddShiftDialog } from './AddShiftDialog';
import { ShiftCalendarHeader } from './calendar/ShiftCalendarHeader';
import { ShiftCalendarGrid } from './calendar/ShiftCalendarGrid';
import { ShiftCalendarLegend } from './calendar/ShiftCalendarLegend';
import { Card, CardContent } from '@/components/ui/card';

interface ShiftCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
}

export function ShiftCalendar({ currentMonth, onMonthChange, isAdminOrSocio }: ShiftCalendarProps) {
  const { shifts, isLoading, loadShifts, setSelectedShift } = useShifts();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"week" | "day" | "month">("week");

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
    setSelectedUserId(userId);
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
        <div className="grid grid-cols-7 gap-px bg-muted">
          {/* Weekday headers */}
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
            <div key={day} className="bg-background py-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}
          
          {/* Month grid */}
          {daysInView.map((day) => {
            const dayShifts = shifts.filter(s => {
              const shiftDate = parseISO(s.shift_date);
              return isSameDay(shiftDate, day);
            });
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[100px] bg-background p-1 ${
                  isCurrentMonth ? '' : 'opacity-50'
                } ${isCurrentDay ? 'border border-primary' : ''}`}
                onClick={() => handleCellClick(day, user?.id || null)}
              >
                <div className={`text-right text-sm mb-1 ${
                  isCurrentDay ? 'font-bold text-primary' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="flex flex-col gap-1 overflow-auto max-h-[80px]">
                  {dayShifts.map(shift => (
                    <Badge 
                      key={shift.id}
                      variant={
                        shift.shift_type === 'full_day' ? 'success' : 
                        shift.shift_type === 'half_day' ? 'secondary' :
                        shift.shift_type === 'sick_leave' ? 'destructive' :
                        shift.shift_type === 'unavailable' ? 'outline' : 'default'
                      }
                      className="text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedShift(shift);
                        setIsAddDialogOpen(true);
                      }}
                    >
                      {isAdminOrSocio && (
                        <span className="font-medium mr-1">
                          {shift.user_first_name?.substring(0, 1)}.{shift.user_last_name?.substring(0, 1)}.
                        </span>
                      )}
                      {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time
                        ? `${shift.start_time.substring(0, 5)}-${shift.end_time.substring(0, 5)}`
                        : shift.shift_type === 'half_day'
                        ? shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio'
                        : shift.shift_type === 'full_day' ? 'Giornata intera'
                        : shift.shift_type === 'sick_leave' ? 'Malattia'
                        : 'Non disponibile'}
                    </Badge>
                  ))}
                  {dayShifts.length === 0 && isCurrentMonth && (
                    <div 
                      className="text-xs text-muted-foreground text-center py-1 px-2 border border-dashed border-muted rounded cursor-pointer hover:border-primary hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCellClick(day, user?.id || null);
                      }}
                    >
                      + Aggiungi turno
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
        defaultUserId={selectedUserId}
      />
    </div>
  );
}
