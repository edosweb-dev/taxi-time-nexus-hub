import { Profile } from '@/lib/types';

export type ShiftType = 
  | 'full_day'      // Giornata Intera
  | 'half_day'      // Mezza Giornata  
  | 'extra'         // Extra
  | 'unavailable';  // Indisponibile

export type HalfDayType = 'morning' | 'afternoon';

/**
 * Input per inserimento singolo turno
 */
export interface SingleShiftInput {
  user_id: string;
  shift_date: string;        // YYYY-MM-DD format
  shift_type: ShiftType;
  half_day_type?: HalfDayType; // Required solo se shift_type = 'half_day'
  notes?: string;
  created_by: string;
  updated_by: string;
}

/**
 * Input per inserimento massivo turni
 */
export interface BatchShiftInput {
  user_ids: string[] | 'all';   // Array di user IDs o 'all' per tutti
  month: number;                 // 1-12
  year: number;
  period_type: 'full_month' | 'single_week' | 'multiple_weeks';
  week?: number;                 // 1-5, required se period_type = 'single_week'
  weeks?: number[];              // Array 1-5, required se period_type = 'multiple_weeks'
  weekdays: number[];            // 0=Domenica, 1=Lunedì, ..., 6=Sabato
  shift_type: ShiftType;
  half_day_type?: HalfDayType;  // Required solo se shift_type = 'half_day'
  notes?: string;
}

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

/**
 * Labels UI per tipi turno
 */
export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  full_day: 'Giornata Intera',
  half_day: 'Mezza Giornata',
  extra: 'Extra',
  unavailable: 'Indisponibile'
};

/**
 * Descrizioni per UI/tooltips
 */
export const SHIFT_TYPE_DESCRIPTIONS: Record<ShiftType, string> = {
  full_day: 'Turno per tutta la giornata',
  half_day: 'Turno di mezza giornata (mattina o pomeriggio)',
  extra: 'Turno aggiuntivo',
  unavailable: 'Non disponibile'
};

/**
 * Labels per tipo mezza giornata
 */
export const HALF_DAY_TYPE_LABELS: Record<HalfDayType, string> = {
  morning: 'Mattina',
  afternoon: 'Pomeriggio'
};
