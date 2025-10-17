import { supabase } from '@/lib/supabase';
import { calcolaStipendioCompleto, CalcoloStipendioCompleto } from './calcolaStipendio';

export interface StipendiAutomaticoUtente {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  numeroServizi: number;
  kmTotali: number;
  oreAttesa: number;
  calcoloCompleto: CalcoloStipendioCompleto | null;
  stipendioEsistente: any | null;
  hasStipendioSalvato: boolean;
}

/**
 * Calcola i KM totali reali dai servizi consuntivati
 */
async function getKmRealiDaServizi(userId: string, mese: number, anno: number): Promise<number> {
  const startDate = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(anno, mese, 0).toISOString().split('T')[0];

  const { data: servizi, error } = await supabase
    .from('servizi')
    .select('km_totali')
    .eq('assegnato_a', userId)
    .in('stato', ['completato', 'consuntivato'])
    .gte('data_servizio', startDate)
    .lte('data_servizio', endDate);

  if (error) {
    console.error('[getKmRealiDaServizi] Errore:', error);
    return 0;
  }

  return servizi.reduce((total, s) => total + (Number(s.km_totali) || 0), 0);
}

/**
 * Calcola le ore di attesa reali dai servizi consuntivati
 */
async function getOreAttesaDaServizi(userId: string, mese: number, anno: number): Promise<number> {
  const startDate = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(anno, mese, 0).toISOString().split('T')[0];

  const { data: servizi, error } = await supabase
    .from('servizi')
    .select('ore_sosta')
    .eq('assegnato_a', userId)
    .in('stato', ['completato', 'consuntivato'])
    .gte('data_servizio', startDate)
    .lte('data_servizio', endDate);

  if (error) {
    console.error('[getOreAttesaDaServizi] Errore:', error);
    return 0;
  }

  return servizi.reduce((total, s) => total + (Number(s.ore_sosta) || 0), 0);
}

/**
 * Conta i servizi consuntivati per un utente
 */
async function getNumeroServizi(userId: string, mese: number, anno: number): Promise<number> {
  const startDate = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(anno, mese, 0).toISOString().split('T')[0];

  const { count, error } = await supabase
    .from('servizi')
    .select('*', { count: 'exact', head: true })
    .eq('assegnato_a', userId)
    .in('stato', ['completato', 'consuntivato'])
    .gte('data_servizio', startDate)
    .lte('data_servizio', endDate);

  if (error) {
    console.error('[getNumeroServizi] Errore:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Ottiene admin e soci con i loro stipendi calcolati automaticamente dai servizi
 * I dipendenti hanno stipendio manuale e non vengono inclusi qui
 */
export async function getStipendiAutomaticiMese(
  mese: number, 
  anno: number
): Promise<StipendiAutomaticoUtente[]> {
  console.log(`[getStipendiAutomaticiMese] Calcolo stipendi per ${mese}/${anno}`);

  try {
    // 1. Ottieni solo admin e soci (dipendenti hanno stipendio manuale)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .in('role', ['admin', 'socio'])
      .order('last_name', { ascending: true });

    if (usersError) {
      console.error('[getStipendiAutomaticiMese] Errore fetch users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('[getStipendiAutomaticiMese] Nessun utente trovato');
      return [];
    }

    // 2. Ottieni gli stipendi già salvati per il mese
    const { data: stipendiSalvati, error: stipendiError } = await supabase
      .from('stipendi')
      .select('*')
      .eq('mese', mese)
      .eq('anno', anno);

    if (stipendiError) {
      console.error('[getStipendiAutomaticiMese] Errore fetch stipendi:', stipendiError);
    }

    const stipendiMap = new Map(
      (stipendiSalvati || []).map(s => [s.user_id, s])
    );

    // 3. Per ogni admin/socio, calcola lo stipendio dai servizi consuntivati
    const risultati: StipendiAutomaticoUtente[] = await Promise.all(
      users.map(async (user) => {
        const stipendioEsistente = stipendiMap.get(user.id);

        try {
          const [numeroServizi, kmTotali, oreAttesa] = await Promise.all([
            getNumeroServizi(user.id, mese, anno),
            getKmRealiDaServizi(user.id, mese, anno),
            getOreAttesaDaServizi(user.id, mese, anno),
          ]);

          // Se non ci sono servizi, restituisci dati vuoti
          if (numeroServizi === 0 || kmTotali === 0) {
            return {
              userId: user.id,
              firstName: user.first_name || '',
              lastName: user.last_name || '',
              role: user.role,
              numeroServizi,
              kmTotali,
              oreAttesa,
              calcoloCompleto: null,
              stipendioEsistente,
              hasStipendioSalvato: !!stipendioEsistente,
            };
          }

          // Calcola lo stipendio completo
          const calcoloCompleto = await calcolaStipendioCompleto({
            userId: user.id,
            mese,
            anno,
            km: kmTotali,
            oreAttesa,
          });

          return {
            userId: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: user.role,
            numeroServizi,
            kmTotali,
            oreAttesa,
            calcoloCompleto,
            stipendioEsistente,
            hasStipendioSalvato: !!stipendioEsistente,
          };
        } catch (error) {
          console.error(`[getStipendiAutomaticiMese] Errore calcolo per user ${user.id}:`, error);
          return {
            userId: user.id,
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            role: user.role,
            numeroServizi: 0,
            kmTotali: 0,
            oreAttesa: 0,
            calcoloCompleto: null,
            stipendioEsistente,
            hasStipendioSalvato: !!stipendioEsistente,
          };
        }
      })
    );

    console.log(`[getStipendiAutomaticiMese] Calcolati ${risultati.length} stipendi`);
    return risultati;
  } catch (error) {
    console.error('[getStipendiAutomaticiMese] Errore generale:', error);
    throw error;
  }
}
