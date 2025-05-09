
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
    let query = supabase
      .from('shifts')
      .select('*');

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

    // Now fetch profile information for all user_ids
    if (shiftsData && shiftsData.length > 0) {
      // Extract unique user ids
      const userIds = [...new Set(shiftsData.map(shift => shift.user_id))];
      
      // Get profile data for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of user_id to profile data
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, { id: string; first_name: string | null; last_name: string | null; }>);
      
      // Merge shifts with profile data
      const shiftsWithProfiles = shiftsData.map(shift => ({
        ...shift,
        user_first_name: profilesMap[shift.user_id]?.first_name || null,
        user_last_name: profilesMap[shift.user_id]?.last_name || null
      }));

      console.log('Shifts with profiles:', shiftsWithProfiles);
      return shiftsWithProfiles as Shift[];
    }

    return shiftsData as Shift[];
  } catch (error) {
    console.error('Error fetching shifts:', error);
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
  return data;
};
