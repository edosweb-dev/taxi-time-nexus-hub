import { supabase } from '@/lib/supabase';
import { UpdateServizioRequest } from './types';

export async function updateServizio({ servizio, passeggeri, email_notifiche }: UpdateServizioRequest) {
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
        applica_provvigione: servizio.applica_provvigione,
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
    const { data: deletedData, error: deleteCollegamentiError } = await supabase
      .from('servizi_passeggeri')
      .delete()
      .eq('servizio_id', servizio.id)
      .select();

    if (deleteCollegamentiError) {
      console.error('[updateServizio] DELETE ERROR:', {
        error: deleteCollegamentiError,
        code: deleteCollegamentiError.code,
        message: deleteCollegamentiError.message,
        details: deleteCollegamentiError.details
      });
      
      // Se l'errore è di permessi, segnalalo chiaramente
      if (deleteCollegamentiError.code === '42501') {
        return { 
          servizio: null, 
          error: { 
            message: 'Permessi insufficienti per modificare i passeggeri del servizio' 
          } 
        };
      }
      
      return { servizio: null, error: deleteCollegamentiError };
    }

    console.log(`[updateServizio] Deleted ${deletedData?.length || 0} existing passenger links`);

    // ✅ Verifica esplicita che non esistano più collegamenti
    const { data: existingLinks } = await supabase
      .from('servizi_passeggeri')
      .select('id')
      .eq('servizio_id', servizio.id);

    if (existingLinks && existingLinks.length > 0) {
      console.warn(`[updateServizio] Still ${existingLinks.length} links after delete!`);
    }

    // 3. Gestisci i passeggeri
    if (passeggeri.length > 0) {
      // ✅ DEDUPLICA passeggeri per passeggero_id
      const uniquePasseggeri = passeggeri.reduce((acc, current) => {
        const duplicate = acc.find(p => 
          p.passeggero_id && current.passeggero_id && 
          p.passeggero_id === current.passeggero_id
        );
        if (!duplicate) {
          acc.push(current);
        } else {
          console.warn(`[updateServizio] Duplicate passenger found: ${current.passeggero_id} - ${current.nome_cognome}`);
        }
        return acc;
      }, [] as typeof passeggeri);

      console.log(`[updateServizio] Processing servizio ${servizio.id}: ${passeggeri.length} passengers total, ${uniquePasseggeri.length} unique`);
      
      if (passeggeri.length !== uniquePasseggeri.length) {
        console.warn(`[updateServizio] Removed ${passeggeri.length - uniquePasseggeri.length} duplicate passengers`);
      }

      for (const passeggeroData of uniquePasseggeri) {
        console.log(`[updateServizio] Processing passenger: ${passeggeroData.passeggero_id || 'NEW'} - ${passeggeroData.nome_cognome}`);
        let passeggeroId = passeggeroData.passeggero_id;

        // Se è un nuovo passeggero, crealo prima
        if (!passeggeroData.passeggero_id) {
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
              referente_id: servizio.referente_id || null, // Può essere null ora
            })
            .select()
            .single();

          if (passeggeroError) {
            console.error('Error creating passeggero:', passeggeroError);
            continue;
          }

          passeggeroId = newPasseggero.id;
        } else {
          // Se passeggero ESISTE, aggiorna i suoi dati
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
            console.error('Error updating passeggero:', updatePasseggeroError);
            continue;
          }

          passeggeroId = passeggeroData.passeggero_id;
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