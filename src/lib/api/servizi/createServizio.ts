
import { supabase } from '@/lib/supabase';
import { Servizio } from '@/lib/types/servizi';
import { CreateServizioRequest } from './types';
import { toast } from '@/components/ui/sonner';
import { createClientePrivato } from '@/lib/api/clientiPrivati';

export async function createServizio(data: CreateServizioRequest): Promise<{ servizio: Servizio | null; error: Error | null }> {
  try {
    console.log('[createServizio] Creating servizio with data:', JSON.stringify(data, null, 2));

    // Get current user session for created_by field
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('[createServizio] Error getting session:', sessionError);
      throw new Error(`Errore di autenticazione: ${sessionError.message}`);
    }
    
    if (!sessionData?.session) {
      console.error('[createServizio] No session found');
      throw new Error('Utente non autenticato');
    }

    const userId = sessionData.session.user.id;
    console.log('[createServizio] Current user ID:', userId);

    let clientePrivatoId = data.servizio.cliente_privato_id;

    // 1. Gestione Cliente Privato (se necessario)
    if (
      data.servizio.tipo_cliente === 'privato' && 
      data.cliente_privato_data?.salva_anagrafica &&
      !clientePrivatoId &&
      data.servizio.cliente_privato_nome &&
      data.servizio.cliente_privato_cognome
    ) {
      console.log('[createServizio] Creating new cliente privato in anagrafica');
      try {
        const nuovoCliente = await createClientePrivato({
          nome: data.servizio.cliente_privato_nome,
          cognome: data.servizio.cliente_privato_cognome,
          email: data.cliente_privato_data.email,
          telefono: data.cliente_privato_data.telefono,
          indirizzo: data.cliente_privato_data.indirizzo,
          citta: data.cliente_privato_data.citta,
          note: data.cliente_privato_data.note,
        });
        clientePrivatoId = nuovoCliente.id;
        console.log('[createServizio] Cliente privato created with ID:', clientePrivatoId);
      } catch (clienteError) {
        console.error('[createServizio] Error creating cliente privato:', clienteError);
        toast.error('Errore nella creazione del cliente privato');
        // Continua comunque con il servizio usando i dati inline
      }
    }

    // 2. Insert servizio
    console.log('[createServizio] Inserting servizio into database');
    const { data: servizioData, error: servizioError } = await supabase
      .from('servizi')
      .insert({
        tipo_cliente: data.servizio.tipo_cliente || 'azienda',
        // Campi azienda (se tipo = azienda)
        azienda_id: data.servizio.tipo_cliente === 'azienda' ? data.servizio.azienda_id : null,
        referente_id: data.servizio.tipo_cliente === 'azienda' ? data.servizio.referente_id : null,
        // Campi cliente privato (se tipo = privato)
        cliente_privato_id: data.servizio.tipo_cliente === 'privato' ? clientePrivatoId : null,
        cliente_privato_nome: data.servizio.tipo_cliente === 'privato' && !clientePrivatoId ? data.servizio.cliente_privato_nome : null,
        cliente_privato_cognome: data.servizio.tipo_cliente === 'privato' && !clientePrivatoId ? data.servizio.cliente_privato_cognome : null,
        numero_commessa: data.servizio.numero_commessa,
        data_servizio: data.servizio.data_servizio,
        orario_servizio: data.servizio.orario_servizio,
        indirizzo_presa: data.servizio.indirizzo_presa,
        indirizzo_destinazione: data.servizio.indirizzo_destinazione,
        citta_presa: data.servizio.citta_presa,
        citta_destinazione: data.servizio.citta_destinazione,
        metodo_pagamento: data.servizio.metodo_pagamento,
        note: data.servizio.note,
        veicolo_id: data.servizio.veicolo_id,
        ore_effettive: data.servizio.ore_effettive,
        ore_fatturate: data.servizio.ore_fatturate,
        applica_provvigione: data.servizio.applica_provvigione,
        stato: data.servizio.stato || 'da_assegnare',
        created_by: userId
      })
      .select()
      .single();

    if (servizioError) {
      console.error('[createServizio] Error creating servizio:', servizioError);
      throw new Error(`Errore nella creazione del servizio: ${servizioError.message}`);
    }

    if (!servizioData) {
      console.error('[createServizio] No data returned after servizio creation');
      throw new Error('Errore nella creazione del servizio: nessun dato restituito');
    }

    console.log('[createServizio] Servizio created successfully:', servizioData);
    const servizio = servizioData as Servizio;

    // 2. Handle passengers
    if (data.passeggeri && data.passeggeri.length > 0) {
      for (const passeggeroData of data.passeggeri) {
        let passeggeroId = passeggeroData.passeggero_id;

        // Se è un nuovo passeggero, crealo prima
        if (!passeggeroData.is_existing || !passeggeroId) {
          console.log('[createServizio] Creating new passeggero:', passeggeroData.nome_cognome);
          
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
              azienda_id: data.servizio.tipo_cliente === 'azienda' ? data.servizio.azienda_id : null,
              referente_id: data.servizio.tipo_cliente === 'azienda' ? (data.servizio.referente_id || null) : null,
            })
            .select()
            .single();

          if (passeggeroError) {
            console.error('[createServizio] Error creating passeggero:', passeggeroError);
            toast.error(`Errore nella creazione del passeggero ${passeggeroData.nome_cognome}: ${passeggeroError.message}`);
            continue;
          }

          passeggeroId = newPasseggero.id;
          console.log('[createServizio] New passeggero created with ID:', passeggeroId);
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
          console.error('[createServizio] Error creating servizio-passeggero link:', collegiamentoError);
          toast.error(`Errore nel collegamento del passeggero ${passeggeroData.nome_cognome}: ${collegiamentoError.message}`);
        }
      }
    }

    // 3. Handle email notifications
    if (data.email_notifiche && data.email_notifiche.length > 0) {
      const emailNotificheData = data.email_notifiche.map(emailId => ({
        servizio_id: servizio.id,
        email_notifica_id: emailId
      }));

      const { error: emailError } = await supabase
        .from('servizi_email_notifiche')
        .insert(emailNotificheData);

      if (emailError) {
        console.error('[createServizio] Error creating email notifications:', emailError);
        // Non blocchiamo la creazione del servizio per questo errore
      }
    }

    return { servizio, error: null };
  } catch (error: any) {
    console.error('[createServizio] Unexpected error:', error);
    return { servizio: null, error: error as Error };
  }
}
