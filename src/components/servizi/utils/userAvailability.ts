
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';

/**
 * Gets available users for a service on a specific date
 * Excludes users:
 * - Without a shift for that day
 * - With "unavailable", "sick_leave", or other blocking status shifts
 * - Already assigned to another service on the same date
 */
export async function getAvailableUsers(date: string, serviceId?: string): Promise<Profile[]> {
  try {
    // First get all users with admin, socio, or dipendente roles
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'socio', 'dipendente']);
    
    if (usersError) throw usersError;
    if (!allUsers || allUsers.length === 0) return [];
    
    const userIds = allUsers.map(user => user.id);
    
    // Get all shifts for the specified date
    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .in('user_id', userIds)
      .eq('shift_date', date);
    
    if (shiftsError) throw shiftsError;
    
    // Get all services assigned on the specified date
    const { data: assignedServices, error: servicesError } = await supabase
      .from('servizi')
      .select('*')
      .in('assegnato_a', userIds)
      .eq('data_servizio', date)
      .neq('id', serviceId || ''); // Exclude the current service if editing
    
    if (servicesError) throw servicesError;
    
    // Map of user ID to availability status
    const userAvailability: Record<string, boolean> = {};
    
    // Process all users' initial availability
    allUsers.forEach(user => {
      userAvailability[user.id] = false; // Default to not available
    });
    
    // Process shifts - mark users as available if they have an appropriate shift
    shifts?.forEach(shift => {
      // User is available if they have a shift that is NOT unavailable or sick leave
      if (shift.shift_type !== 'unavailable' && shift.shift_type !== 'sick_leave') {
        userAvailability[shift.user_id] = true;
      }
    });
    
    // Process assigned services - mark users as unavailable if already assigned
    assignedServices?.forEach(service => {
      if (service.assegnato_a) {
        userAvailability[service.assegnato_a] = false;
      }
    });
    
    // Filter users based on availability
    const availableUsers = allUsers.filter(user => userAvailability[user.id]);
    
    return availableUsers;
  } catch (error) {
    console.error('Error getting available users:', error);
    return [];
  }
}
