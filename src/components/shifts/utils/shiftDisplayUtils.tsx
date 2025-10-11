
import { Clock, Calendar, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Shift } from '../types';

// Helper function to get the appropriate icon for a shift type
export const getShiftTypeIcon = (shiftType: string) => {
  switch (shiftType) {
    case 'full_day':
    case 'half_day':
    case 'extra':
      return <Calendar className="h-4 w-4 text-primary" />;
    case 'unavailable':
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

// Helper function to get the appropriate badge for a shift type
export const getShiftTypeBadge = (shift: Shift) => {
  const shiftTypeMap: Record<string, { label: string, variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success'}> = {
    full_day: { label: 'Giornata intera', variant: 'success' },
    half_day: { 
      label: shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio', 
      variant: 'secondary' 
    },
    extra: { label: 'Extra', variant: 'default' },
    unavailable: { label: 'Non disponibile', variant: 'outline' }
  };
  
  const shiftInfo = shiftTypeMap[shift.shift_type] || { label: shift.shift_type, variant: 'default' };
  
  return (
    <Badge variant={shiftInfo.variant as any}>
      {shiftInfo.label}
    </Badge>
  );
};

// Helper function to get the display text for shift type
export const getShiftTypeDisplay = (shift: Shift) => {
  const shiftTypeMap: Record<string, string> = {
    full_day: 'Giornata intera',
    half_day: shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio',
    extra: 'Extra',
    unavailable: 'Non disponibile'
  };
  
  return shiftTypeMap[shift.shift_type] || shift.shift_type;
};

// Helper function to get the appropriate color variant for a shift status
export const getShiftStatusColor = (shiftType: string): 'default' | 'outline' | 'secondary' | 'destructive' | 'success' => {
  switch (shiftType) {
    case 'full_day':
      return 'success';
    case 'half_day':
      return 'secondary';
    case 'extra':
      return 'default';
    case 'unavailable':
      return 'outline';
    default:
      return 'default';
  }
};

// Helper function to get the appropriate color variant for a shift status (alias for compatibility)
export const getShiftTypeColor = getShiftStatusColor;

// Helper function to get the display text for shift time
export const getShiftTimeDisplay = (shift: Shift) => {
  switch (shift.shift_type) {
    case 'full_day':
      return 'Tutto il giorno';
    case 'half_day':
      return shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio';
    case 'extra':
      return 'Extra';
    case 'unavailable':
      return 'Non disponibile';
    default:
      return '';
  }
};
