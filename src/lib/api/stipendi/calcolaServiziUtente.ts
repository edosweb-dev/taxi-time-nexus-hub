
import { supabase } from '@/lib/supabase';

/**
 * Recupera e calcola i KM totali dai servizi completati per un utente in un mese specifico
 */
export async function getKmServiziMese(userId: string, mese: number, anno: number) {
  try {
    console.log(`[getKmServiziMese] Calcolando KM per user ${userId}, ${mese}/${anno}`);
    
    // Calcola date inizio e fine mese
    const startDate = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(anno, mese, 0).toISOString().split('T')[0];
    
    // Recupera i servizi completati/consuntivati assegnati all'utente nel mese
    const { data, error } = await supabase
      .from('servizi')
      .select('*')
      .eq('assegnato_a', userId)
      .in('stato', ['completato', 'consuntivato'])
      .gte('data_servizio', startDate)
      .lte('data_servizio', endDate);
      
    if (error) {
      console.error('[getKmServiziMese] Errore nel recupero servizi:', error);
      throw error;
    }
    
    // TODO: Implementare algoritmo reale di calcolo KM basato su indirizzi
    // Per ora, impostiamo un valore medio per servizio (45 km)
    const kmMedi = 45;
    const kmTotali = data.length * kmMedi;
    
    console.log(`[getKmServiziMese] Trovati ${data.length} servizi, calcolati ${kmTotali} km totali`);
    
    return {
      servizi: data.length,
      kmTotali: kmTotali,
      dettaglioServizi: data
    };
  } catch (error) {
    console.error('[getKmServiziMese] Errore durante il calcolo KM:', error);
    throw error;
  }
}

/**
 * Recupera e calcola le ore lavorate dai servizi completati per un utente in un mese specifico
 */
export async function getOreLavorateServiziMese(userId: string, mese: number, anno: number) {
  try {
    console.log(`[getOreLavorateServiziMese] Calcolando ore per user ${userId}, ${mese}/${anno}`);
    
    // Calcola date inizio e fine mese
    const startDate = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(anno, mese, 0).toISOString().split('T')[0];
    
    // Recupera i servizi completati/consuntivati assegnati all'utente nel mese
    const { data, error } = await supabase
      .from('servizi')
      .select('*')
      .eq('assegnato_a', userId)
      .in('stato', ['completato', 'consuntivato'])
      .gte('data_servizio', startDate)
      .lte('data_servizio', endDate);
      
    if (error) {
      console.error('[getOreLavorateServiziMese] Errore nel recupero servizi:', error);
      throw error;
    }
    
    // Calcola ore totali dai servizi
    let oreTotali = 0;
    
    data.forEach(servizio => {
      // SEMPLIFICAZIONE: Usa SOLO ore_sosta (unico campo valido)
      // Se mancante, default 2 ore (servizi vecchi non consuntivati)
      const oreDaAggiungere = servizio.ore_sosta ? 
        Number(servizio.ore_sosta) : 2;
      
      oreTotali += oreDaAggiungere;
    });
    
    console.log(`[getOreLavorateServiziMese] Trovati ${data.length} servizi, calcolate ${oreTotali} ore totali`);
    
    return {
      servizi: data.length,
      oreTotali: oreTotali,
      dettaglioServizi: data
    };
  } catch (error) {
    console.error('[getOreLavorateServiziMese] Errore durante il calcolo ore:', error);
    throw error;
  }
}

/**
 * Recupera i dati aggregati dai servizi per un utente in un mese specifico
 */
export async function getDatiServiziUtente(userId: string, mese: number, anno: number) {
  try {
    const [kmData, oreData] = await Promise.all([
      getKmServiziMese(userId, mese, anno),
      getOreLavorateServiziMese(userId, mese, anno)
    ]);
    
    return {
      km: kmData,
      ore: oreData,
      numeroServizi: kmData.servizi
    };
  } catch (error) {
    console.error('[getDatiServiziUtente] Errore durante il recupero dati servizi:', error);
    throw error;
  }
}
