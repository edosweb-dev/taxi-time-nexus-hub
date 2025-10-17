
import { supabase } from '@/lib/supabase';
import { Stipendio } from './types';
import { CalcoloStipendioCompleto } from './calcolaStipendio';

export interface UpdateStipendioParams {
  stipendioId: string;
  formData: {
    km?: number;
    ore_attesa?: number;
    ore_lavorate?: number;
    tariffa_oraria?: number;
    note?: string;
  };
  calcolo?: CalcoloStipendioCompleto | null;
}

export async function updateStipendio(params: UpdateStipendioParams): Promise<Stipendio> {
  try {
    console.log('[updateStipendio] Updating stipendio with params:', params);

    const { stipendioId, formData, calcolo } = params;

    // Get current user for updated_by tracking
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current stipendio to determine tipo_calcolo
    const { data: currentStipendio, error: fetchError } = await supabase
      .from('stipendi')
      .select('tipo_calcolo, stato')
      .eq('id', stipendioId)
      .single();

    if (fetchError) {
      console.error('[updateStipendio] Error fetching current stipendio:', fetchError);
      throw fetchError;
    }

    if (!currentStipendio) {
      throw new Error('Stipendio not found');
    }

    // Check if stipendio can be modified (only if state is 'bozza')
    if (currentStipendio.stato !== 'bozza') {
      throw new Error('CANNOT_MODIFY_CONFIRMED');
    }

    // Prepare update object with only changed fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update input fields based on tipo_calcolo
    if (currentStipendio.tipo_calcolo === 'socio') {
      if (formData.km !== undefined) updateData.totale_km = formData.km;
      if (formData.ore_attesa !== undefined) updateData.totale_ore_attesa = formData.ore_attesa;
    } else {
      if (formData.ore_lavorate !== undefined) updateData.totale_ore_lavorate = formData.ore_lavorate;
    }

    // Update notes if provided
    if (formData.note !== undefined) updateData.note = formData.note;

    // Update calculation results if provided
    if (calcolo) {
      updateData.base_calcolo = calcolo.baseKm || (formData.ore_lavorate && formData.tariffa_oraria ? formData.ore_lavorate * formData.tariffa_oraria : null);
      updateData.coefficiente_applicato = calcolo.dettaglioCalcolo.parametriInput.coefficiente || null;
      updateData.totale_lordo = calcolo.totaleLordo;
      updateData.totale_spese = calcolo.detrazioni?.totaleSpesePersonali || null;
      updateData.totale_prelievi = calcolo.detrazioni?.totalePrelievi || null;
      updateData.incassi_da_dipendenti = calcolo.detrazioni?.incassiDaDipendenti || null;
      updateData.riporto_mese_precedente = calcolo.detrazioni?.riportoMesePrecedente || null;
      updateData.totale_netto = calcolo.totaleNetto;
    } else if (currentStipendio.tipo_calcolo === 'dipendente' && formData.ore_lavorate && formData.tariffa_oraria) {
      // For dipendenti without complex calculation
      const totaleLordo = formData.ore_lavorate * formData.tariffa_oraria;
      updateData.base_calcolo = totaleLordo;
      updateData.totale_lordo = totaleLordo;
      updateData.totale_netto = totaleLordo; // Simple case, no detractions
    }

    console.log('[updateStipendio] Update data:', updateData);

    // Update in database
    const { data, error } = await supabase
      .from('stipendi')
      .update(updateData)
      .eq('id', stipendioId)
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
      console.error('[updateStipendio] Database error:', error);
      
      if (error.code === '42501' || error.message.includes('permission')) {
        throw new Error('PERMISSION_DENIED');
      }
      
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from database');
    }

    console.log('[updateStipendio] Stipendio updated successfully:', data.id);

    return {
      ...data,
      tipo_calcolo: data.tipo_calcolo as 'socio' | 'dipendente',
      stato: data.stato as 'bozza' | 'confermato' | 'pagato'
    };
  } catch (error) {
    console.error('[updateStipendio] Error updating stipendio:', error);
    throw error;
  }
}
