export interface Shift {
  id: string;
  user_id: string;
  shift_date: string; // YYYY-MM-DD format
  shift_type: string; // Will be typed as 'work' | 'sick_leave' | 'vacation' | 'unavailable' at runtime
  start_time?: string; // HH:MM format
  end_time?: string; // HH:MM format
  start_date?: string;
  end_date?: string;
  half_day_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CreateShiftData {
  user_id: string;
  shift_date: string;
  shift_type: 'work' | 'sick_leave' | 'vacation' | 'unavailable';
  start_time?: string;
  end_time?: string;
  notes?: string;
}

export interface UpdateShiftData extends Partial<CreateShiftData> {
  id: string;
}

export interface ShiftFilters {
  user_ids?: string[];
  start_date?: string;
  end_date?: string;
  shift_types?: string[];
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  color?: string;
}