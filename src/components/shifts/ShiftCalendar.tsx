
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
  isWithinInterval
} from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useShifts, Shift } from './ShiftContext';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { AddShiftDialog } from './AddShiftDialog';

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

  // Get days of current month view
  const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth]);
  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);
  const startDate = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]); // Monday
  const endDate = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 1 }), [monthEnd]);
  
  // Memoize days to avoid recalculation
  const days = useMemo(() => 
    eachDayOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate]
  );

  // Load shifts when month changes
  useMemo(() => {
    loadShifts(startDate, endDate);
  }, [startDate, endDate, loadShifts]);

  // Get shifts for a specific day
  const getShiftsForDay = (day: Date) => {
    const dayFormatted = format(day, 'yyyy-MM-dd');
    
    return shifts.filter(shift => {
      // For single day shifts
      if (shift.shift_date === dayFormatted) return true;
      
      // For multi-day shifts (sick leave, unavailable)
      if (shift.start_date && shift.shift_type === 'sick_leave' || shift.shift_type === 'unavailable') {
        const startDateObj = parseISO(shift.start_date);
        const endDateObj = shift.end_date ? parseISO(shift.end_date) : undefined;
        
        if (!endDateObj) return format(startDateObj, 'yyyy-MM-dd') === dayFormatted;
        
        return isWithinInterval(day, { 
          start: startDateObj, 
          end: endDateObj 
        });
      }
      
      return false;
    });
  };

  // Group shifts by user for a given day
  const getShiftsByUserForDay = (day: Date) => {
    const dayShifts = getShiftsForDay(day);
    const userShifts: Record<string, Shift[]> = {};
    
    dayShifts.forEach(shift => {
      if (!userShifts[shift.user_id]) {
        userShifts[shift.user_id] = [];
      }
      userShifts[shift.user_id].push(shift);
    });
    
    return userShifts;
  };

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const handleCellClick = (day: Date, userId: string | null = null) => {
    setSelectedDate(day);
    setSelectedUserId(userId);
    setIsAddDialogOpen(true);
  };

  const renderShiftBadge = (shift: Shift) => {
    const shiftTypeMap: Record<string, { label: string, variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success'}> = {
      specific_hours: { 
        label: shift.start_time && shift.end_time 
          ? `${shift.start_time.substring(0, 5)}-${shift.end_time.substring(0, 5)}` 
          : 'Orario specifico', 
        variant: 'default' 
      },
      full_day: { label: 'Giornata intera', variant: 'success' },
      half_day: { 
        label: shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio', 
        variant: 'secondary' 
      },
      sick_leave: { label: 'Malattia', variant: 'destructive' },
      unavailable: { label: 'Non disponibile', variant: 'outline' }
    };
    
    const shiftInfo = shiftTypeMap[shift.shift_type] || { label: shift.shift_type, variant: 'default' };
    
    return (
      <Badge 
        key={shift.id} 
        variant={shiftInfo.variant as any}
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
        {shiftInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Caricamento turni...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onMonthChange(new Date())}
          >
            Oggi
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted mb-1">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
          <div
            key={day}
            className="bg-background py-2 text-center text-sm font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted">
        {days.map((day) => {
          const userShifts = getShiftsByUserForDay(day);
          const dayInMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const dayHasShifts = Object.keys(userShifts).length > 0;
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] bg-background p-1 ${
                dayInMonth ? '' : 'opacity-50'
              } ${isCurrentDay ? 'border border-primary' : ''}`}
              onClick={() => handleCellClick(day, user?.id || null)}
            >
              <div className={`text-right text-sm mb-1 ${
                isCurrentDay ? 'font-bold text-primary' : ''
              }`}>
                {format(day, 'd')}
              </div>
              <div className="flex flex-col gap-1 overflow-auto max-h-[80px]">
                {Object.entries(userShifts).map(([userId, userDayShifts]) => (
                  <div key={userId} className="flex flex-col gap-0.5">
                    {userDayShifts.map(shift => renderShiftBadge(shift))}
                  </div>
                ))}
                {!dayHasShifts && dayInMonth && (
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
