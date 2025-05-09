
import { Clock, Calendar, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Shift } from '../types';

// Helper function to get the appropriate icon for a shift type
export const getShiftTypeIcon = (shiftType: string) => {
  switch (shiftType) {
    case 'specific_hours':
      return <Clock className="h-4 w-4 text-primary" />;
    case 'full_day':
    case 'half_day':
      return <Calendar className="h-4 w-4 text-primary" />;
    case 'sick_leave':
    case 'unavailable':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

// Helper function to get the appropriate badge for a shift type
export const getShiftTypeBadge = (shift: Shift) => {
  const shiftTypeMap: Record<string, { label: string, variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success'}> = {
    specific_hours: { 
      label: 'Orario specifico', 
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
    <Badge variant={shiftInfo.variant as any}>
      {shiftInfo.label}
    </Badge>
  );
};

// Helper function to get the display text for shift time
export const getShiftTimeDisplay = (shift: Shift) => {
  switch (shift.shift_type) {
    case 'specific_hours':
      return shift.start_time && shift.end_time 
        ? `${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)}` 
        : '';
    case 'full_day':
      return 'Tutto il giorno';
    case 'half_day':
      return shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio';
    case 'sick_leave':
    case 'unavailable':
      const startDate = shift.start_date ? format(parseISO(shift.start_date), 'dd/MM/yyyy') : '';
      const endDate = shift.end_date ? format(parseISO(shift.end_date), 'dd/MM/yyyy') : '';
      return startDate === endDate || !endDate ? startDate : `${startDate} - ${endDate}`;
    default:
      return '';
  }
};
