import { supabase } from '@/lib/supabase';
import { UpdateServizioRequest } from './types';
import { calculateServizioStato } from '@/utils/servizioValidation';

export async function updateServizio({ servizio, passeggeri, email_notifiche }: UpdateServizioRequest) {
  try {
    // 1. Calcola stato automatico SOLO se in bozza (usa logica centralizzata)
    const statoServizio = servizio.stato === 'bozza'
      ? calculateServizioStato(servizio as any)
      : servizio.stato;

    // 2. Aggiorna il servizio
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
        applica_provvigione: servizio.applica_provvigione,
        assegnato_a: servizio.assegnato_a,
        conducente_esterno: servizio.conducente_esterno,
        conducente_esterno_nome: servizio.conducente_esterno_nome,
        conducente_esterno_email: servizio.conducente_esterno_email,
        conducente_esterno_id: servizio.conducente_esterno_id,
        stato: statoServizio,
        // Campi consuntivo (permettono correzioni post-consuntivazione)
        incasso_ricevuto: servizio.incasso_ricevuto,
        ore_sosta: servizio.ore_sosta,
        km_totali: servizio.km_totali,
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
        const salvaInDatabase = passeggeroData.salva_in_database !== false; // default true

        // NUOVO PASSEGGERO
        if (!passeggeroData.is_existing || !passeggeroId) {
          
          // CASO 1: salva_in_database = TRUE → Crea in anagrafica permanente
          if (salvaInDatabase) {
            console.log('[updateServizio] Creating new passeggero in anagrafica:', passeggeroData.nome_cognome);
            
            const { data: newPasseggero, error: passeggeroError } = await supabase
              .from('passeggeri')
              .insert({
                nome_cognome: passeggeroData.nome_cognome,
                nome: passeggeroData.nome,
                cognome: passeggeroData.cognome,
                localita: passeggeroData.localita,
                indirizzo: passeggeroData.indirizzo,
                email: passeggeroData.email,
                telefono: passeggeroData.telefono,
                azienda_id: servizio.azienda_id,
                referente_id: servizio.referente_id || null,
              })
              .select()
              .single();

            if (passeggeroError) {
              console.error('[updateServizio] Error creating passeggero:', passeggeroError);
              continue;
            }

            passeggeroId = newPasseggero.id;
            console.log('[updateServizio] New passeggero created with ID:', passeggeroId);
          } 
          // CASO 2: salva_in_database = FALSE → NON creare in anagrafica
          else {
            console.log('[updateServizio] Passeggero one-time use (not saved in anagrafica):', passeggeroData.nome_cognome);
            // passeggeroId rimane null, dati salvati solo in servizi_passeggeri
          }
        } else {
          // PASSEGGERO ESISTENTE: aggiorna dati
          if (salvaInDatabase) {
            const { error: updatePasseggeroError } = await supabase
              .from('passeggeri')
              .update({
                nome_cognome: passeggeroData.nome_cognome,
                nome: passeggeroData.nome,
                cognome: passeggeroData.cognome,
                localita: passeggeroData.localita,
                indirizzo: passeggeroData.indirizzo,
                email: passeggeroData.email,
                telefono: passeggeroData.telefono,
              })
              .eq('id', passeggeroData.passeggero_id);

            if (updatePasseggeroError) {
              console.error('[updateServizio] Error updating passeggero:', updatePasseggeroError);
              continue;
            }
          }
        }

        // CREA COLLEGAMENTO servizio-passeggero (sempre, anche se passeggeroId è null)
        const collegamentoData: any = {
          servizio_id: servizio.id,
          passeggero_id: passeggeroId, // può essere null se salva_in_database = false
          orario_presa_personalizzato: passeggeroData.usa_indirizzo_personalizzato ? passeggeroData.orario_presa_personalizzato : null,
          luogo_presa_personalizzato: passeggeroData.usa_indirizzo_personalizzato ? passeggeroData.luogo_presa_personalizzato : null,
          destinazione_personalizzato: passeggeroData.usa_indirizzo_personalizzato ? passeggeroData.destinazione_personalizzato : null,
          usa_indirizzo_personalizzato: passeggeroData.usa_indirizzo_personalizzato || false,
          salva_in_database: salvaInDatabase,
        };

        // Se passeggero NON salvato in anagrafica, salva dati inline
        if (!passeggeroId && !salvaInDatabase) {
          collegamentoData.nome_cognome_inline = passeggeroData.nome_cognome;
          collegamentoData.email_inline = passeggeroData.email || null;
          collegamentoData.telefono_inline = passeggeroData.telefono || null;
          collegamentoData.localita_inline = passeggeroData.localita || null;
          collegamentoData.indirizzo_inline = passeggeroData.indirizzo || null;
        }

        console.log('[updateServizio] Creating servizio-passeggero link:', {
          passeggero_id: passeggeroId,
          salva_in_database: salvaInDatabase,
          has_inline_data: !passeggeroId && !salvaInDatabase
        });

        const { error: collegiamentoError } = await supabase
          .from('servizi_passeggeri')
          .insert(collegamentoData);

        if (collegiamentoError) {
          console.error('[updateServizio] Error creating servizio-passeggero link:', collegiamentoError);
        }
      }
    }

    // 4. Gestisci email notifiche (DELETE + RE-INSERT)
    const { error: deleteEmailError } = await supabase
      .from('servizi_email_notifiche')
      .delete()
      .eq('servizio_id', servizio.id);

    if (deleteEmailError) {
      console.error('Error deleting existing email notifications:', deleteEmailError);
    }

    if (email_notifiche && email_notifiche.length > 0) {
      const emailNotificheData = email_notifiche.map(emailId => ({
        servizio_id: servizio.id,
        email_notifica_id: emailId
      }));

      const { error: emailError } = await supabase
        .from('servizi_email_notifiche')
        .insert(emailNotificheData);

      if (emailError) {
        console.error('Error creating email notifications:', emailError);
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