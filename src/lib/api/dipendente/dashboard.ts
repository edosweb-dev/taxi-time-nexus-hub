import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from "date-fns";
import { it } from "date-fns/locale";

export interface ServizioOggi {
  id: string;
  orario_servizio: string;
  stato: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  aziende: {
    nome: string;
  } | null;
  veicoli: {
    modello: string;
    targa: string;
  } | null;
}

export interface StatsMese {
  serviziCompletati: number;
  kmTotali: number;
}

export interface UltimoStipendio {
  id: string;
  totale_netto: number;
  mese: number;
  anno: number;
}

export interface TurnoSettimana {
  id: string;
  shift_date: string;
  shift_type: string;
  half_day_type: string | null;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
}

/**
 * Fetches servizi assigned to dipendente for today
 */
export async function getServiziOggi(userId: string): Promise<ServizioOggi[]> {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('servizi')
    .select(`
      id,
      orario_servizio,
      stato,
      indirizzo_presa,
      indirizzo_destinazione,
      aziende:azienda_id (
        nome
      ),
      veicoli:veicolo_id (
        modello,
        targa
      )
    `)
    .eq('assegnato_a', userId)
    .eq('data_servizio', today)
    .order('orario_servizio', { ascending: true });

  if (error) {
    console.error('Error fetching servizi oggi:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches statistics for specified month (completed services and total km)
 */
export async function getStatisticheMese(
  userId: string, 
  month?: number, 
  year?: number
): Promise<StatsMese> {
  const now = new Date();
  const targetDate = month && year ? new Date(year, month - 1) : now;
  const startMonth = format(startOfMonth(targetDate), 'yyyy-MM-dd');
  const endMonth = format(endOfMonth(targetDate), 'yyyy-MM-dd');

  // Count completed services
  const { count, error: countError } = await supabase
    .from('servizi')
    .select('*', { count: 'exact', head: true })
    .eq('assegnato_a', userId)
    .eq('stato', 'completato')
    .gte('data_servizio', startMonth)
    .lte('data_servizio', endMonth);

  if (countError) {
    console.error('Error counting servizi:', countError);
    throw countError;
  }

  // Sum total KM (from ore_effettive or ore_lavorate as km proxy)
  // Note: In real scenario, you'd have a km column. Using ore_effettive * 20 as estimate
  const { data: serviziData, error: kmError } = await supabase
    .from('servizi')
    .select('ore_effettive, ore_lavorate')
    .eq('assegnato_a', userId)
    .eq('stato', 'completato')
    .gte('data_servizio', startMonth)
    .lte('data_servizio', endMonth);

  if (kmError) {
    console.error('Error fetching km data:', kmError);
    throw kmError;
  }

  // Estimate KM (ore * 20 km average per hour)
  const kmTotali = (serviziData || []).reduce((sum, servizio) => {
    const ore = servizio.ore_effettive || servizio.ore_lavorate || 0;
    return sum + (Number(ore) * 20);
  }, 0);

  return {
    serviziCompletati: count || 0,
    kmTotali: Math.round(kmTotali)
  };
}

/**
 * Fetches last stipendio for dipendente
 */
export async function getUltimoStipendio(userId: string): Promise<UltimoStipendio | null> {
  const { data, error } = await supabase
    .from('stipendi')
    .select('id, totale_netto, mese, anno')
    .eq('user_id', userId)
    .order('anno', { ascending: false })
    .order('mese', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching ultimo stipendio:', error);
    throw error;
  }

  return data;
}

/**
 * Fetches shifts for specified week (Monday to Sunday)
 */
export async function getTurniSettimana(
  userId: string,
  startWeek?: string,
  endWeek?: string
): Promise<TurnoSettimana[]> {
  const now = new Date();
  const weekStart = startWeek || format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = endWeek || format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('shifts')
    .select('id, shift_date, shift_type, half_day_type, start_time, end_time, notes')
    .eq('user_id', userId)
    .gte('shift_date', weekStart)
    .lte('shift_date', weekEnd)
    .order('shift_date', { ascending: true });

  if (error) {
    console.error('Error fetching turni settimana:', error);
    throw error;
  }

  return data || [];
}
