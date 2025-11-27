
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Shift, ShiftFormData } from './types';

// Function to fetch shifts
export const fetchShifts = async ({ 
  start, 
  end, 
  isAdminOrSocio, 
  userId 
}: { 
  start: Date; 
  end: Date; 
  isAdminOrSocio: boolean; 
  userId?: string 
}) => {
  try {
    console.log('[fetchShifts] Starting fetch with params:', { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd'), isAdminOrSocio, userId });

    // Single query with JOIN to fetch shifts and user data together
    let query = supabase
      .from('shifts')
      .select(`
        *,
        user:profiles!user_id(id, first_name, last_name, email, color),
        created_by_user:profiles!created_by(id, first_name, last_name),
        updated_by_user:profiles!updated_by(id, first_name, last_name)
      `);

    // If not admin/socio, only fetch own shifts
    if (!isAdminOrSocio && userId) {
      query = query.eq('user_id', userId);
    } else if (userId) {
      // If admin/socio AND userId is provided, filter by that user
      query = query.eq('user_id', userId);
    }

    // Add date range filter
    query = query
      .gte('shift_date', format(start, 'yyyy-MM-dd'))
      .lte('shift_date', format(end, 'yyyy-MM-dd'));

    const { data: shiftsData, error: shiftsError } = await query;

    if (shiftsError) throw shiftsError;

    console.log('[fetchShifts] Shifts data with joined profiles:', shiftsData);

    // Map the joined data to maintain compatibility with existing components
    const shiftsWithProfiles = (shiftsData || []).map((shift: any) => {
      const shiftWithProfile = {
        ...shift,
        user_first_name: shift.user?.first_name || null,
        user_last_name: shift.user?.last_name || null,
        user_email: shift.user?.email || null,
        user_color: shift.user?.color || null
      };
      
      console.log(`[fetchShifts] Shift ${shift.id} - User: ${shift.user_id}, Name: ${shiftWithProfile.user_first_name} ${shiftWithProfile.user_last_name}, Color: ${shiftWithProfile.user_color}`);
      
      return shiftWithProfile;
    });

    console.log('[fetchShifts] Final shifts with profiles:', shiftsWithProfiles);
    return shiftsWithProfiles as Shift[];
  } catch (error) {
    console.error('[fetchShifts] Error fetching shifts:', error);
    toast.error('Errore nel caricamento dei turni');
    throw error;
  }
};

// Function to create a shift
export const createShiftApi = async (data: ShiftFormData, userId: string) => {
  const shiftData = {
    user_id: data.user_id,
    shift_date: format(data.shift_date, 'yyyy-MM-dd'),
    shift_type: data.shift_type,
    start_time: data.start_time,
    end_time: data.end_time,
    half_day_type: data.half_day_type || null,
    start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd') : null,
    end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
    notes: data.notes || null,
    created_by: userId,
    updated_by: userId
  };

  console.log('Creating shift with data:', shiftData);

  const { data: result, error } = await supabase
    .from('shifts')
    .insert(shiftData)
    .select();

  if (error) {
    console.error('Error details from Supabase:', error);
    throw error;
  }

  console.log('Shift created successfully:', result);
  return result[0];
};

// Function to update a shift
export const updateShiftApi = async (id: string, data: ShiftFormData, userId: string) => {
  const shiftData = {
    user_id: data.user_id,
    shift_date: format(data.shift_date, 'yyyy-MM-dd'),
    shift_type: data.shift_type,
    start_time: data.start_time,
    end_time: data.end_time,
    half_day_type: data.half_day_type || null,
    start_date: data.start_date ? format(data.start_date, 'yyyy-MM-dd') : null,
    end_date: data.end_date ? format(data.end_date, 'yyyy-MM-dd') : null,
    notes: data.notes || null,
    updated_by: userId
  };

  console.log('Updating shift with ID:', id, 'Data:', shiftData);

  const { data: result, error } = await supabase
    .from('shifts')
    .update(shiftData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error details from Supabase:', error);
    throw error;
  }

  console.log('Shift updated successfully:', result);
  return result[0];
};

// Function to delete a shift
export const deleteShiftApi = async (id: string) => {
  console.log('Deleting shift with ID:', id);
  
  const { data, error } = await supabase
    .from('shifts')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error details from Supabase:', error);
    throw error;
  }

  console.log('Shift deleted successfully:', data);
  
  if (!data || data.length === 0) {
    console.warn('No shift was deleted - possible permission issue or shift not found');
    throw new Error('Turno non trovato o permessi insufficienti per eliminarlo');
  }
  
  return data[0];
};
