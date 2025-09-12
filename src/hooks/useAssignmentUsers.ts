import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile, UserRole } from '@/lib/types';

export interface AssignmentUser extends Profile {
  displayStatus: 'Disponibile' | 'In servizio' | 'Non disponibile' | 'Turno assente';
  isRecommended: boolean;
  hasShift: boolean;
  isAlreadyAssigned: boolean;
}

/**
 * Hook for managing users available for service assignment
 * Provides fallback logic when no users have shifts configured
 */
export function useAssignmentUsers(serviceDate: string, serviceId?: string) {
  const [processedUsers, setProcessedUsers] = useState<AssignmentUser[]>([]);

  // Get all eligible users
  const { data: allUsers = [], isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['assignment-users'],
    queryFn: async () => {
      console.log('[useAssignmentUsers] Fetching all eligible users');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'socio', 'dipendente']);
      
      if (error) throw error;
      
      // Ensure proper role typing
      return (data || []).map(user => ({
        ...user,
        role: user.role as UserRole
      })) as Profile[];
    },
  });

  // Get shifts for the date
  const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ['user-shifts', serviceDate],
    queryFn: async () => {
      if (!allUsers.length) return [];
      
      console.log('[useAssignmentUsers] Fetching shifts for date:', serviceDate);
      const userIds = allUsers.map(u => u.id);
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .in('user_id', userIds)
        .eq('shift_date', serviceDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: allUsers.length > 0,
  });

  // Get already assigned users
  const { data: assignedUsers = [], isLoading: isLoadingAssigned } = useQuery({
    queryKey: ['assigned-users', serviceDate, serviceId],
    queryFn: async () => {
      if (!allUsers.length) return [];
      
      console.log('[useAssignmentUsers] Fetching already assigned users for date:', serviceDate);
      const userIds = allUsers.map(u => u.id);
      
      let query = supabase
        .from('servizi')
        .select('assegnato_a')
        .in('assegnato_a', userIds)
        .eq('data_servizio', serviceDate)
        .not('assegnato_a', 'is', null);
      
      if (serviceId) {
        query = query.neq('id', serviceId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(s => s.assegnato_a).filter(Boolean);
    },
    enabled: allUsers.length > 0,
  });

  // Process users with availability logic
  const processUsers = useCallback(() => {
    if (!allUsers.length) {
      setProcessedUsers([]);
      return;
    }

    console.log('[useAssignmentUsers] Processing users with availability logic');
    
    // Create lookup sets
    const usersWithValidShifts = new Set<string>();
    const usersAlreadyAssigned = new Set(assignedUsers);
    
    // Process shifts
    shifts.forEach(shift => {
      if (shift.shift_type !== 'unavailable' && shift.shift_type !== 'sick_leave') {
        usersWithValidShifts.add(shift.user_id);
      }
    });

    console.log('[useAssignmentUsers] Availability summary:', {
      totalUsers: allUsers.length,
      usersWithShifts: usersWithValidShifts.size,
      usersAlreadyAssigned: usersAlreadyAssigned.size,
      shiftsConfigured: shifts.length > 0
    });

    // Process each user
    const processed: AssignmentUser[] = allUsers.map(user => {
      const hasShift = usersWithValidShifts.has(user.id);
      const isAlreadyAssigned = usersAlreadyAssigned.has(user.id);
      
      let displayStatus: AssignmentUser['displayStatus'];
      let isRecommended = false;

      if (isAlreadyAssigned) {
        displayStatus = 'In servizio';
      } else if (shifts.length === 0) {
        // FALLBACK: No shifts configured - show all users as available
        displayStatus = 'Disponibile';
        isRecommended = true;
      } else if (hasShift) {
        displayStatus = 'Disponibile';
        isRecommended = true;
      } else {
        displayStatus = 'Turno assente';
      }

      return {
        ...user,
        displayStatus,
        isRecommended,
        hasShift,
        isAlreadyAssigned
      };
    });

    // Sort: recommended first, then by name
    processed.sort((a, b) => {
      if (a.isRecommended !== b.isRecommended) {
        return a.isRecommended ? -1 : 1;
      }
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    });

    console.log('[useAssignmentUsers] Processed users:', {
      available: processed.filter(u => u.isRecommended).length,
      unavailable: processed.filter(u => !u.isRecommended).length
    });

    setProcessedUsers(processed);
  }, [allUsers, shifts, assignedUsers]);

  useEffect(() => {
    processUsers();
  }, [processUsers]);

  const isLoading = isLoadingUsers || isLoadingShifts || isLoadingAssigned;
  const availableUsers = processedUsers.filter(u => u.isRecommended);
  const unavailableUsers = processedUsers.filter(u => !u.isRecommended);

  return {
    users: processedUsers,
    availableUsers,
    unavailableUsers,
    isLoading,
    error: usersError,
    hasShiftsConfigured: shifts.length > 0
  };
}