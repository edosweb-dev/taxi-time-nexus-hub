import { supabase } from '@/lib/supabase';
import { UpdateServizioRequest } from './types';

export async function updateServizio({ servizio, passeggeri }: UpdateServizioRequest) {
  try {
    // 1. Aggiorna il servizio
    const { data: servizioData, error: servizioError } = await supabase
      .from('servizi')
      .update({
        azienda_id: servizio.azienda_id,
        referente_id: servizio.referente_id,
        numero_commessa: servizio.numero_commessa,
        data_servizio: servizio.data_servizio,
        orario_servizio: servizio.orario_servizio,
        indirizzo_presa: servizio.indirizzo_presa,
        indirizzo_destinazione: servizio.indirizzo_destinazione,
        citta_presa: servizio.citta_presa,
        citta_destinazione: servizio.citta_destinazione,
        metodo_pagamento: servizio.metodo_pagamento,
        note: servizio.note,
        veicolo_id: servizio.veicolo_id,
        ore_effettive: servizio.ore_effettive,
        ore_fatturate: servizio.ore_fatturate,
        assegnato_a: servizio.assegnato_a,
        conducente_esterno: servizio.conducente_esterno,
        conducente_esterno_nome: servizio.conducente_esterno_nome,
        conducente_esterno_email: servizio.conducente_esterno_email,
        conducente_esterno_id: servizio.conducente_esterno_id,
      })
      .eq('id', servizio.id)
      .select()
      .single();

    if (servizioError) {
      console.error('Error updating servizio:', servizioError);
      return { servizio: null, error: servizioError };
    }

    // 2. Rimuovi tutti i collegamenti passeggeri esistenti
    const { error: deleteCollegamentiError } = await supabase
      .from('servizi_passeggeri')
      .delete()
      .eq('servizio_id', servizio.id);

    if (deleteCollegamentiError) {
      console.error('Error deleting existing passenger links:', deleteCollegamentiError);
      return { servizio: null, error: deleteCollegamentiError };
    }

    // 3. Gestisci i passeggeri
    if (passeggeri.length > 0) {
      for (const passeggeroData of passeggeri) {
        let passeggeroId = passeggeroData.passeggero_id;

        // Se è un nuovo passeggero, crealo prima
        if (!passeggeroData.passeggero_id) {
          const { data: newPasseggero, error: passeggeroError } = await supabase
            .from('passeggeri')
            .insert({
              nome_cognome: passeggeroData.nome_cognome,
              email: passeggeroData.email,
              telefono: passeggeroData.telefono,
              azienda_id: servizio.azienda_id,
              referente_id: servizio.referente_id || null, // Può essere null ora
            })
            .select()
            .single();

          if (passeggeroError) {
            console.error('Error creating passeggero:', passeggeroError);
            continue;
          }

          passeggeroId = newPasseggero.id;
        }

        // Crea il collegamento servizio-passeggero
        const { error: collegiamentoError } = await supabase
          .from('servizi_passeggeri')
          .insert({
            servizio_id: servizio.id,
            passeggero_id: passeggeroId,
            orario_presa_personalizzato: passeggeroData.usa_indirizzo_personalizzato ? passeggeroData.orario_presa_personalizzato : null,
            luogo_presa_personalizzato: passeggeroData.usa_indirizzo_personalizzato ? passeggeroData.luogo_presa_personalizzato : null,
            destinazione_personalizzato: passeggeroData.usa_indirizzo_personalizzato ? passeggeroData.destinazione_personalizzato : null,
            usa_indirizzo_personalizzato: passeggeroData.usa_indirizzo_personalizzato
          });

        if (collegiamentoError) {
          console.error('Error creating servizio-passeggero link:', collegiamentoError);
        }
      }
    }

    console.log('Servizio updated successfully:', servizioData);
    return { servizio: servizioData, error: null };

  } catch (error) {
    console.error('Unexpected error updating servizio:', error);
    return { 
      servizio: null, 
      error: { 
        message: error instanceof Error ? error.message : 'Errore sconosciuto durante l\'aggiornamento del servizio' 
      } 
    };
  }
}