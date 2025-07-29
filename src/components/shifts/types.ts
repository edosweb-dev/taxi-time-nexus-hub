import { Profile } from '@/lib/types';

export type ShiftType = 'specific_hours' | 'full_day' | 'half_day' | 'sick_leave' | 'unavailable';
export type HalfDayType = 'morning' | 'afternoon' | null;

export interface Shift {
  id: string;
  user_id: string;
  shift_date: string;
  shift_type: ShiftType;
  start_time: string | null;
  end_time: string | null;
  half_day_type: HalfDayType;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  user_first_name?: string | null;
  user_last_name?: string | null;
  user_email?: string | null; // Added email as fallback
  user_color?: string | null; // Added color for employee color coding
}

export interface ShiftFormData {
  user_id: string;
  shift_date: Date;
  shift_type: ShiftType;
  start_time?: string | null;
  end_time?: string | null;
  half_day_type?: HalfDayType;
  start_date?: Date | null;
  end_date?: Date | null;
  notes?: string | null;
}

export interface ShiftContextType {
  shifts: Shift[];
  isLoading: boolean;
  isError: boolean;
  createShift: (data: ShiftFormData) => Promise<void>;
  updateShift: (id: string, data: ShiftFormData) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  loadShifts: (startDate: Date, endDate: Date) => void;
  setSelectedShift: (shift: Shift | null) => void;
  selectedShift: Shift | null;
  filteredUserId: string | null;
  setUserFilter: (userId: string | null) => void;
  filteredDate: Date | null;
  setDateFilter: (date: Date | null) => void;
}
