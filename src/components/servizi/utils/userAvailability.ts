
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/lib/types';

/**
 * Gets available users for a service on a specific date
 * Excludes users:
 * - Without a shift for that day
 * - With "unavailable", "sick_leave", or other blocking status shifts
 * - Already assigned to another service on the same date
 */
export async function getAvailableUsers(date: string, serviceId?: string): Promise<Profile[]> {
  try {
    console.log('[getAvailableUsers] Starting with params:', { date, serviceId });
    
    // First get all users with admin, socio, or dipendente roles
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'socio', 'dipendente']);
    
    if (usersError) {
      console.error('[getAvailableUsers] Error fetching users:', usersError);
      throw usersError;
    }
    
    if (!allUsers || allUsers.length === 0) {
      console.log('[getAvailableUsers] No users found with required roles');
      return [];
    }
    
    console.log(`[getAvailableUsers] Found ${allUsers.length} users with required roles`);
    
    const userIds = allUsers.map(user => user.id);
    
    // Get all shifts for the specified date
    const { data: shifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .in('user_id', userIds)
      .eq('shift_date', date);
    
    if (shiftsError) {
      console.error('[getAvailableUsers] Error fetching shifts:', shiftsError);
      throw shiftsError;
    }
    
    console.log(`[getAvailableUsers] Found ${shifts?.length || 0} shifts for date ${date}`);
    
    // Get all services assigned on the specified date (excluding current service if editing)
    let servicesQuery = supabase
      .from('servizi')
      .select('assegnato_a')
      .in('assegnato_a', userIds)
      .eq('data_servizio', date)
      .not('assegnato_a', 'is', null);
    
    // Exclude the current service if we're editing
    if (serviceId) {
      servicesQuery = servicesQuery.neq('id', serviceId);
    }
    
    const { data: assignedServices, error: servicesError } = await servicesQuery;
    
    if (servicesError) {
      console.error('[getAvailableUsers] Error fetching assigned services:', servicesError);
      throw servicesError;
    }
    
    console.log(`[getAvailableUsers] Found ${assignedServices?.length || 0} users already assigned on ${date}`);
    
    // Create sets for faster lookup
    const usersWithShifts = new Set<string>();
    const usersAlreadyAssigned = new Set<string>();
    
    // Process shifts - mark users as having a valid shift
    shifts?.forEach(shift => {
      // User has a valid shift if it's NOT unavailable or sick leave
      if (shift.shift_type !== 'unavailable' && shift.shift_type !== 'sick_leave') {
        usersWithShifts.add(shift.user_id);
        console.log(`[getAvailableUsers] User ${shift.user_id} has valid shift: ${shift.shift_type}`);
      } else {
        console.log(`[getAvailableUsers] User ${shift.user_id} has blocking shift: ${shift.shift_type}`);
      }
    });
    
    // Process assigned services - mark users as already assigned
    assignedServices?.forEach(service => {
      if (service.assegnato_a) {
        usersAlreadyAssigned.add(service.assegnato_a);
        console.log(`[getAvailableUsers] User ${service.assegnato_a} is already assigned to another service`);
      }
    });
    
    // Filter users based on availability criteria
    const availableUsers = allUsers.filter(user => {
      const hasValidShift = usersWithShifts.has(user.id);
      const isAlreadyAssigned = usersAlreadyAssigned.has(user.id);
      
      // FIX: Soci sempre disponibili, dipendenti possono avere più servizi
      const isSocio = user.role === 'socio';
      const isAvailable = isSocio || hasValidShift;
      // NOTA: isAlreadyAssigned NON blocca più la disponibilità
      
      console.log(`[getAvailableUsers] User ${user.first_name} ${user.last_name} (${user.id}):`, {
        hasValidShift,
        isAlreadyAssigned,
        isSocio,
        isAvailable
      });
      
      return isAvailable;
    });
    
    console.log(`[getAvailableUsers] Final result: ${availableUsers.length} available users`);
    
    // Ensure proper type casting for user roles
    const validRoles: UserRole[] = ['admin', 'socio', 'dipendente', 'cliente'];
    const sanitizedUsers: Profile[] = availableUsers.map(user => ({
      ...user,
      role: validRoles.includes(user.role as UserRole) 
        ? (user.role as UserRole) 
        : 'dipendente' as UserRole // Fallback to 'dipendente' if role is invalid
    }));
    
    return sanitizedUsers;
  } catch (error) {
    console.error('[getAvailableUsers] Unexpected error:', error);
    return [];
  }
}
