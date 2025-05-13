
import { useAuth } from '@/hooks/useAuth';
import { ShiftCalendarView } from './calendar/ShiftCalendarView';
import { eachDayOfInterval, subMonths, addMonths } from 'date-fns';

interface ShiftCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
  selectedUserId?: string | null;
}

export function ShiftCalendar(props: ShiftCalendarProps) {
  // This component now just passes props to the ShiftCalendarView
  return (
    <ShiftCalendarView {...props} />
  );
}
