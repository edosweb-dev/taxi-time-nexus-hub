
import { supabase } from '@/lib/supabase';
import { StipendioFormData, Stipendio } from './types';
import { CalcoloStipendioCompleto } from './calcolaStipendio';

export interface CreateStipendioParams {
  formData: {
    user_id: string;
    km?: number;
    ore_attesa?: number;
    ore_lavorate?: number;
    tariffa_oraria?: number;
    note?: string;
  };
  mese: number;
  anno: number;
  calcolo?: CalcoloStipendioCompleto | null;
}

export async function createStipendio(params: CreateStipendioParams): Promise<Stipendio> {
  try {
    console.log('[createStipendio] Creating stipendio with params:', params);

    const { formData, mese, anno, calcolo } = params;

    // Get current user for created_by field
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Determina il tipo di calcolo basato sui campi presenti
    const tipoCalcolo = formData.km ? 'socio' : 'dipendente';

    // Prepara l'oggetto stipendio
    const stipendioData = {
      user_id: formData.user_id,
      mese,
      anno,
      tipo_calcolo: tipoCalcolo as 'socio' | 'dipendente',
      // Dati input
      totale_km: formData.km || null,
      totale_ore_attesa: formData.ore_attesa || null,
      totale_ore_lavorate: formData.ore_lavorate || null,
      // Dati calcolo (se disponibili)
      base_calcolo: calcolo?.baseKm || (formData.ore_lavorate && formData.tariffa_oraria ? formData.ore_lavorate * formData.tariffa_oraria : null),
      coefficiente_applicato: calcolo?.dettaglioCalcolo.parametriUsati.coefficienteAumento || null,
      totale_lordo: calcolo?.totaleLordo || (formData.ore_lavorate && formData.tariffa_oraria ? formData.ore_lavorate * formData.tariffa_oraria : null),
      totale_spese: calcolo?.detrazioni?.totaleSpesePersonali || null,
      totale_prelievi: calcolo?.detrazioni?.totalePrelievi || null,
      incassi_da_dipendenti: calcolo?.detrazioni?.incassiDaDipendenti || null,
      riporto_mese_precedente: calcolo?.detrazioni?.riportoMesePrecedente || null,
      totale_netto: calcolo?.totaleNetto || (formData.ore_lavorate && formData.tariffa_oraria ? formData.ore_lavorate * formData.tariffa_oraria : null),
      percentuale_su_totale: null, // Da calcolare successivamente se necessario
      stato: 'bozza' as const,
      note: formData.note || null,
      created_by: user.id,
    };

    console.log('[createStipendio] Prepared stipendio data:', stipendioData);

    // Inserisci nel database
    const { data, error } = await supabase
      .from('stipendi')
      .insert(stipendioData)
      .select(`
        *,
        user:profiles!stipendi_user_id_fkey (
          first_name,
          last_name,
          role
        )
      `)
      .single();

    if (error) {
      console.error('[createStipendio] Database error:', error);
      
      // Gestisci errori specifici
      if (error.code === '23505' && error.message.includes('stipendi_user_id_mese_anno_key')) {
        throw new Error('DUPLICATE_STIPENDIO');
      }
      
      if (error.code === '42501' || error.message.includes('permission')) {
        throw new Error('PERMISSION_DENIED');
      }
      
      throw error;
    }

    if (!data) {
      throw new Error('Nessun dato restituito dal database');
    }

    console.log('[createStipendio] Stipendio created successfully:', data.id);

    return {
      ...data,
      tipo_calcolo: data.tipo_calcolo as 'socio' | 'dipendente',
      stato: data.stato as 'bozza' | 'confermato' | 'pagato'
    };
  } catch (error) {
    console.error('[createStipendio] Error creating stipendio:', error);
    throw error;
  }
}
