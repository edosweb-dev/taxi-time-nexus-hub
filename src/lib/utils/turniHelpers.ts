import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, isSameDay, isToday, isPast, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export interface Shift {
  id: string;
  shift_date: string;
  shift_type: 'full_day' | 'half_day' | 'specific_hours' | 'sick_leave' | 'unavailable' | 'extra';
  half_day_type?: 'morning' | 'afternoon';
  start_time?: string;
  end_time?: string;
  notes?: string;
  created_by: string;
  user_id: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isToday: boolean;
  isPast: boolean;
  turno?: Shift;
  dayOfWeek: number;
}

/**
 * Generate calendar days for a month with shift data
 */
export function generateCalendarDays(
  year: number,
  month: number,
  turni: Shift[]
): CalendarDay[] {
  const firstDay = startOfMonth(new Date(year, month - 1));
  const lastDay = endOfMonth(firstDay);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  return days.map(date => {
    // Find shift for this date (could be single date or within range)
    const turno = turni.find(t => {
      const shiftDate = parseISO(t.shift_date);
      if (isSameDay(shiftDate, date)) return true;
      
      // Check if within multi-day range
      if (t.start_date && t.end_date) {
        const startDate = parseISO(t.start_date);
        const endDate = parseISO(t.end_date);
        return date >= startDate && date <= endDate;
      }
      
      return false;
    });

    return {
      date,
      dayNumber: getDate(date),
      isToday: isToday(date),
      isPast: isPast(date) && !isToday(date),
      turno,
      dayOfWeek: date.getDay(),
    };
  });
}

/**
 * Get turno badge configuration
 */
export function getTurnoBadge(shift?: Shift) {
  if (!shift) {
    return {
      label: '-',
      className: 'bg-gray-200 text-gray-500',
      emoji: '',
    };
  }

  const configs = {
    full_day: {
      label: 'Turno Completo',
      className: 'bg-blue-500 text-white',
      emoji: '🟦',
    },
    half_day: {
      label: 'Mezza Giornata',
      className: 'bg-yellow-500 text-white',
      emoji: '🟨',
    },
    specific_hours: {
      label: 'Ore Specifiche',
      className: 'bg-green-500 text-white',
      emoji: '🟩',
    },
    sick_leave: {
      label: 'Malattia',
      className: 'bg-red-500 text-white',
      emoji: '🤒',
    },
    unavailable: {
      label: 'Non Disponibile',
      className: 'bg-gray-400 text-white',
      emoji: '❌',
    },
    extra: {
      label: 'Straordinario',
      className: 'bg-purple-500 text-white',
      emoji: '➕',
    },
  };

  return configs[shift.shift_type] || configs.full_day;
}

/**
 * Get turno display time
 */
export function getTurnoTime(shift?: Shift): string {
  if (!shift) return '';

  switch (shift.shift_type) {
    case 'full_day':
      return '8-16';
    case 'half_day':
      return shift.half_day_type === 'morning' ? '8-12' : '12-16';
    case 'specific_hours':
      if (shift.start_time && shift.end_time) {
        return `${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}`;
      }
      return '9-17';
    case 'sick_leave':
      return 'Malattia';
    case 'unavailable':
      return 'N/D';
    case 'extra':
      return 'Extra';
    default:
      return '';
  }
}

/**
 * Calculate shift duration in hours
 */
export function getShiftDuration(shift: Shift): number {
  if (shift.shift_type === 'full_day') return 8;
  if (shift.shift_type === 'half_day') return 4;
  if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
    const [startHour, startMin] = shift.start_time.split(':').map(Number);
    const [endHour, endMin] = shift.end_time.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60;
  }
  return 0;
}

/**
 * Format date in Italian
 */
export function formatItalianDate(date: Date): string {
  return format(date, "EEEE d MMMM yyyy", { locale: it });
}

/**
 * Get padding days for calendar grid (to fill first week)
 */
export function getCalendarPaddingDays(year: number, month: number): number {
  const firstDay = startOfMonth(new Date(year, month - 1));
  const dayOfWeek = firstDay.getDay();
  // Convert Sunday (0) to 7 for easier calculation
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}
