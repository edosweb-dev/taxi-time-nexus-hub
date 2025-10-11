
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Shift } from '../types';

export interface UserShiftStats {
  user_id: string;
  user_first_name: string | null;
  user_last_name: string | null;
  user_email: string | null;
  total_hours: number;
  working_days: number;
  sick_days: number;
  unavailable_days: number;
  full_days: number;
  half_days: number;
  specific_hours_shifts: number;
  average_hours_per_day: number;
}

export interface AllUsersShiftStats {
  users: UserShiftStats[];
  period: {
    start_date: string;
    end_date: string;
  };
}

// Calcola le ore lavorate per un turno
const calculateShiftHours = (shift: Shift): number => {
  if (shift.shift_type === 'full_day') {
    return 8; // Assumiamo 8 ore per giornata intera
  } else if (shift.shift_type === 'half_day') {
    return 4; // Assumiamo 4 ore per mezza giornata
  }
  return 0;
};

// Fetch statistiche per un singolo utente
export const fetchUserShiftStats = async (
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<UserShiftStats | null> => {
  try {
    console.log(`[fetchUserShiftStats] Fetching stats for user ${userId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);

    // Fetch turni per l'utente nel periodo specificato
    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .gte('shift_date', format(startDate, 'yyyy-MM-dd'))
      .lte('shift_date', format(endDate, 'yyyy-MM-dd'));

    if (shiftsError) throw shiftsError;

    // Fetch informazioni utente
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    if (!shiftsData || shiftsData.length === 0) {
      return {
        user_id: userId,
        user_first_name: profileData?.first_name || null,
        user_last_name: profileData?.last_name || null,
        user_email: profileData?.email || null,
        total_hours: 0,
        working_days: 0,
        sick_days: 0,
        unavailable_days: 0,
        full_days: 0,
        half_days: 0,
        specific_hours_shifts: 0,
        average_hours_per_day: 0,
      };
    }

    // Calcola statistiche
    let totalHours = 0;
    let workingDays = 0;
    let sickDays = 0;
    let unavailableDays = 0;
    let fullDays = 0;
    let halfDays = 0;
    let specificHoursShifts = 0;

    shiftsData.forEach(shift => {
      const shiftHours = calculateShiftHours(shift as Shift);
      
      switch (shift.shift_type) {
        case 'full_day':
          fullDays++;
          totalHours += shiftHours;
          workingDays++;
          break;
        case 'half_day':
          halfDays++;
          totalHours += shiftHours;
          workingDays++;
          break;
        case 'extra':
          specificHoursShifts++;
          totalHours += shiftHours;
          workingDays++;
          break;
        case 'unavailable':
          unavailableDays++;
          break;
      }
    });

    const averageHoursPerDay = workingDays > 0 ? totalHours / workingDays : 0;

    return {
      user_id: userId,
      user_first_name: profileData?.first_name || null,
      user_last_name: profileData?.last_name || null,
      user_email: profileData?.email || null,
      total_hours: Math.round(totalHours * 100) / 100,
      working_days: workingDays,
      sick_days: sickDays,
      unavailable_days: unavailableDays,
      full_days: fullDays,
      half_days: halfDays,
      specific_hours_shifts: specificHoursShifts,
      average_hours_per_day: Math.round(averageHoursPerDay * 100) / 100,
    };
  } catch (error) {
    console.error('[fetchUserShiftStats] Error:', error);
    toast.error('Errore nel caricamento delle statistiche utente');
    throw error;
  }
};

// Fetch statistiche per tutti gli utenti
export const fetchAllUsersShiftStats = async (
  startDate: Date, 
  endDate: Date
): Promise<AllUsersShiftStats> => {
  try {
    console.log(`[fetchAllUsersShiftStats] Fetching stats for all users from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);

    // Fetch tutti gli utenti (esclusi i clienti per i turni)
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role')
      .in('role', ['admin', 'socio', 'dipendente']);

    if (usersError) throw usersError;

    if (!usersData || usersData.length === 0) {
      return {
        users: [],
        period: {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
        },
      };
    }

    // Fetch statistiche per ogni utente
    const userStatsPromises = usersData.map(user => 
      fetchUserShiftStats(user.id, startDate, endDate)
    );

    const userStats = await Promise.all(userStatsPromises);
    
    // Filtra gli utenti che hanno almeno un turno o sono rilevanti
    const filteredStats = userStats.filter(stat => stat !== null) as UserShiftStats[];

    return {
      users: filteredStats,
      period: {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      },
    };
  } catch (error) {
    console.error('[fetchAllUsersShiftStats] Error:', error);
    toast.error('Errore nel caricamento delle statistiche degli utenti');
    throw error;
  }
};

// Fetch turni dettagliati per un utente
export const fetchUserShiftDetails = async (
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<Shift[]> => {
  try {
    console.log(`[fetchUserShiftDetails] Fetching detailed shifts for user ${userId}`);

    const { data: shiftsData, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .gte('shift_date', format(startDate, 'yyyy-MM-dd'))
      .lte('shift_date', format(endDate, 'yyyy-MM-dd'))
      .order('shift_date', { ascending: false });

    if (shiftsError) throw shiftsError;

    // Aggiungi informazioni utente ai turni
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.warn('[fetchUserShiftDetails] Could not fetch profile:', profileError);
    }

    // Mappa i turni con le informazioni utente
    const shiftsWithProfile = (shiftsData || []).map(shift => ({
      ...shift,
      user_first_name: profileData?.first_name || null,
      user_last_name: profileData?.last_name || null,
      user_email: profileData?.email || null,
    }));

    return shiftsWithProfile as Shift[];
  } catch (error) {
    console.error('[fetchUserShiftDetails] Error:', error);
    toast.error('Errore nel caricamento dei turni dettagliati');
    throw error;
  }
};
