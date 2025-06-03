
import { supabase } from '@/lib/supabase';
import { StatoStipendio } from './types';

export interface UpdateStatoStipendioParams {
  stipendioId: string;
  nuovoStato: StatoStipendio;
}

export interface UpdateStatoStipendioResult {
  stipendio: any;
  spesaAziendaleCreata?: boolean;
}

export async function updateStatoStipendio({ 
  stipendioId, 
  nuovoStato 
}: UpdateStatoStipendioParams): Promise<UpdateStatoStipendioResult> {
  try {
    console.log(`[updateStatoStipendio] Updating stipendio ${stipendioId} to ${nuovoStato}`);

    // Prima recupera i dati dello stipendio per validazioni
    const { data: currentStipendio, error: fetchError } = await supabase
      .from('stipendi')
      .select(`
        *,
        user:profiles!stipendi_user_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('id', stipendioId)
      .single();

    if (fetchError) {
      console.error('[updateStatoStipendio] Error fetching current stipendio:', fetchError);
      throw fetchError;
    }

    if (!currentStipendio) {
      throw new Error('Stipendio non trovato');
    }

    // Validazioni transizioni di stato
    const statoCorrente = currentStipendio.stato as StatoStipendio;
    
    if (statoCorrente === 'bozza' && nuovoStato !== 'confermato') {
      throw new Error('Da bozza si può passare solo a confermato');
    }
    
    if (statoCorrente === 'confermato' && nuovoStato !== 'pagato') {
      throw new Error('Da confermato si può passare solo a pagato');
    }
    
    if (statoCorrente === 'pagato') {
      throw new Error('Non è possibile modificare uno stipendio già pagato');
    }

    // Aggiorna lo stato dello stipendio
    const { data: updatedStipendio, error: updateError } = await supabase
      .from('stipendi')
      .update({ 
        stato: nuovoStato,
        updated_at: new Date().toISOString()
      })
      .eq('id', stipendioId)
      .select(`
        *,
        user:profiles!stipendi_user_id_fkey (
          first_name,
          last_name
        )
      `)
      .single();

    if (updateError) {
      console.error('[updateStatoStipendio] Error updating stipendio:', updateError);
      throw updateError;
    }

    let spesaAziendaleCreata = false;

    // Se il nuovo stato è "pagato", crea la spesa aziendale
    if (nuovoStato === 'pagato') {
      try {
        // Recupera la prima modalità di pagamento disponibile
        const { data: modalita, error: modalitaError } = await supabase
          .from('modalita_pagamenti')
          .select('id')
          .eq('attivo', true)
          .order('nome')
          .limit(1)
          .single();

        if (modalitaError) {
          console.error('[updateStatoStipendio] Error fetching modalita pagamento:', modalitaError);
          throw new Error('Nessuna modalità di pagamento disponibile');
        }

        // Crea il record nella tabella spese_aziendali
        const { error: spesaError } = await supabase
          .from('spese_aziendali')
          .insert({
            data_movimento: new Date().toISOString().split('T')[0],
            importo: currentStipendio.totale_netto || 0,
            causale: `Stipendio ${currentStipendio.user?.first_name || ''} ${currentStipendio.user?.last_name || ''} - ${getMonthName(currentStipendio.mese)} ${currentStipendio.anno}`,
            tipologia: 'spesa',
            modalita_pagamento_id: modalita.id,
            stato_pagamento: 'completato',
            note: `Pagamento stipendio automatico - ID: ${stipendioId}`,
            created_by: updatedStipendio.created_by
          });

        if (spesaError) {
          console.error('[updateStatoStipendio] Error creating spesa aziendale:', spesaError);
          // Non blocchiamo l'operazione, ma logghiamo l'errore
        } else {
          spesaAziendaleCreata = true;
          console.log('[updateStatoStipendio] Spesa aziendale created successfully');
        }
      } catch (spesaError) {
        console.error('[updateStatoStipendio] Error in spesa aziendale creation:', spesaError);
        // Non blocchiamo l'operazione principale
      }
    }

    console.log(`[updateStatoStipendio] Successfully updated stipendio to ${nuovoStato}`);
    
    return { 
      stipendio: updatedStipendio, 
      spesaAziendaleCreata 
    };
  } catch (error) {
    console.error('[updateStatoStipendio] Error:', error);
    throw error;
  }
}

function getMonthName(monthNumber: number): string {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return months[monthNumber - 1] || 'Sconosciuto';
}
