import { supabase } from "@/integrations/supabase/client";
import { Servizio } from "@/lib/types/servizi";

export interface ServizioWithRelations extends Servizio {
  azienda_nome?: string;
  veicolo_modello?: string;
  veicolo_targa?: string;
  referente_nome?: string;
}

export interface ServiziFilters {
  stati?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  aziendaId?: string;
  search?: string;
}

/**
 * Fetches assigned services for a dipendente with filters and pagination
 */
export async function getServiziAssegnati(
  userId: string,
  filters: ServiziFilters = {},
  offset: number = 0,
  limit: number = 20
): Promise<{ data: ServizioWithRelations[]; count: number }> {
  let query = supabase
    .from('servizi')
    .select(`
      *,
      aziende!left(nome),
      veicoli!left(modello, targa),
      profiles!referente_id(first_name, last_name)
    `, { count: 'exact' })
    .eq('assegnato_a', userId);

  // Apply filters
  if (filters.stati && filters.stati.length > 0) {
    query = query.in('stato', filters.stati);
  }

  if (filters.dateRange) {
    query = query
      .gte('data_servizio', filters.dateRange.start)
      .lte('data_servizio', filters.dateRange.end);
  }

  if (filters.aziendaId) {
    query = query.eq('azienda_id', filters.aziendaId);
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`
      numero_commessa.ilike.${searchTerm},
      indirizzo_presa.ilike.${searchTerm},
      indirizzo_destinazione.ilike.${searchTerm}
    `);
  }

  // Order by date and time
  query = query
    .order('data_servizio', { ascending: true })
    .order('orario_servizio', { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching servizi assegnati:', error);
    throw error;
  }

  // Transform data to include flat fields
  const transformedData: ServizioWithRelations[] = (data || []).map(servizio => {
    const profile = Array.isArray(servizio.profiles) ? servizio.profiles[0] : servizio.profiles;
    const { aziende, veicoli, profiles: _, ...rest } = servizio;
    
    return {
      ...rest,
      azienda_nome: aziende?.nome,
      veicolo_modello: veicoli?.modello,
      veicolo_targa: veicoli?.targa,
      referente_nome: profile ? 
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
        undefined
    } as ServizioWithRelations;
  });

  return {
    data: transformedData,
    count: count || 0
  };
}

/**
 * Fetches list of companies for filter dropdown (only companies with assigned services)
 */
export async function getAziendeForDipendente(userId: string) {
  const { data, error } = await supabase
    .from('servizi')
    .select('azienda_id, aziende!left(id, nome)')
    .eq('assegnato_a', userId)
    .not('azienda_id', 'is', null);

  if (error) {
    console.error('Error fetching aziende for dipendente:', error);
    throw error;
  }

  // Get unique companies
  const uniqueAziende = new Map();
  data?.forEach(item => {
    if (item.aziende && !uniqueAziende.has(item.aziende.id)) {
      uniqueAziende.set(item.aziende.id, item.aziende);
    }
  });

  return Array.from(uniqueAziende.values());
}
