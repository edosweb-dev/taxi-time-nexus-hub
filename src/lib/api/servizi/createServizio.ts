
import { supabase } from '@/lib/supabase';
import { Servizio } from '@/lib/types/servizi';
import { CreateServizioRequest } from './types';
import { toast } from '@/components/ui/sonner';
import { createClientePrivato } from '@/lib/api/clientiPrivati';
import { calculateServizioStato } from '@/utils/servizioValidation';

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

    // 2. Calcola stato automatico usando la logica centralizzata di validazione
    const statoServizio = calculateServizioStato({
      ...data.servizio,
      stato: data.servizio.stato || 'bozza' // default a bozza se non specificato
    });

    console.log('[createServizio] Inserting servizio into database with stato:', statoServizio);
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
        iva: 10,
        ore_effettive: data.servizio.ore_effettive,
        ore_fatturate: data.servizio.ore_fatturate,
        applica_provvigione: data.servizio.applica_provvigione,
        assegnato_a: data.servizio.assegnato_a,
        conducente_esterno: data.servizio.conducente_esterno,
        conducente_esterno_nome: data.servizio.conducente_esterno_nome,
        conducente_esterno_email: data.servizio.conducente_esterno_email,
        conducente_esterno_id: data.servizio.conducente_esterno_id,
        stato: statoServizio,
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
    console.log('═══════════════════════════════════');
    console.log('🔍 [createServizio] STARTING PASSENGER PROCESSING');
    console.log('🔍 Total passengers:', data.passeggeri?.length);
    console.log('🔍 All passengers data:');
    data.passeggeri?.forEach((p, i) => {
      console.log(`  Passenger ${i + 1}:`, {
        nome_cognome: p.nome_cognome,
        is_existing: p.is_existing,
        salva_in_database: p.salva_in_database,
        usa_indirizzo_personalizzato: p.usa_indirizzo_personalizzato,
        typeof_usa_indirizzo: typeof p.usa_indirizzo_personalizzato,
      });
    });
    console.log('═══════════════════════════════════');
    
    if (data.passeggeri && data.passeggeri.length > 0) {
      for (const passeggeroData of data.passeggeri) {
        let passeggeroId = passeggeroData.passeggero_id;
        const salvaInDatabase = passeggeroData.salva_in_database === true; // explicit true check

        // NUOVO PASSEGGERO
        if (!passeggeroData.is_existing || !passeggeroId) {
          // ✅ SEMPRE crea passeggero, distingui con campo tipo
          const tipo = salvaInDatabase ? 'rubrica' : 'temporaneo';
          
          console.log(`[createServizio] Creating passeggero tipo "${tipo}":`, passeggeroData.nome_cognome);
          
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
              tipo: tipo,
            })
            .select()
            .single();

          if (passeggeroError) {
            console.error('[createServizio] Error creating passeggero:', passeggeroError);
            toast.error(`Errore nella creazione del passeggero ${passeggeroData.nome_cognome}: ${passeggeroError.message}`);
            continue;
          }

          passeggeroId = newPasseggero.id;
          console.log(`[createServizio] Passeggero ${tipo} created with ID:`, passeggeroId);
        }

        // CREA COLLEGAMENTO servizio-passeggero
        console.log('───────────────────────────────────');
        console.log(`🔍 [createServizio] Processing passenger ${data.passeggeri.indexOf(passeggeroData) + 1}/${data.passeggeri.length}`);
        console.log('passeggeroData received:', {
          nome_cognome: passeggeroData.nome_cognome,
          is_existing: passeggeroData.is_existing,
          salva_in_database: passeggeroData.salva_in_database,
          usa_indirizzo_personalizzato: passeggeroData.usa_indirizzo_personalizzato,
          typeof_usa_indirizzo: typeof passeggeroData.usa_indirizzo_personalizzato,
          has_field: 'usa_indirizzo_personalizzato' in passeggeroData,
        });
        console.log('passeggeroId:', passeggeroId);
        console.log('salvaInDatabase:', salvaInDatabase);
        
        // ✅ FORZA campo a boolean ESPLICITO
        const usaIndirizzoPersonalizzato = Boolean(passeggeroData.usa_indirizzo_personalizzato ?? false);
        
        console.log('🔍 [createServizio] Forced usaIndirizzoPersonalizzato:', usaIndirizzoPersonalizzato);
        
        const collegamentoData: any = {
          servizio_id: servizio.id,
          passeggero_id: passeggeroId, // ora sempre valorizzato
          orario_presa_personalizzato: usaIndirizzoPersonalizzato
            ? passeggeroData.orario_presa_personalizzato 
            : null,
          luogo_presa_personalizzato: usaIndirizzoPersonalizzato
            ? passeggeroData.luogo_presa_personalizzato 
            : null,
          destinazione_personalizzato: usaIndirizzoPersonalizzato
            ? passeggeroData.destinazione_personalizzato 
            : null,
          usa_indirizzo_personalizzato: usaIndirizzoPersonalizzato,  // ✅ Forzato a boolean
          salva_in_database: Boolean(salvaInDatabase ?? true),  // ✅ Forzato a boolean
        };

        console.log('🔍 [createServizio] collegamentoData BEFORE INSERT:', JSON.stringify(collegamentoData, null, 2));

        const { error: collegamentoError } = await supabase
          .from('servizi_passeggeri')
          .insert(collegamentoData);

        if (collegamentoError) {
          console.error('[createServizio] Error creating servizio-passeggero link:', collegamentoError);
          toast.error(`Errore nel collegamento del passeggero ${passeggeroData.nome_cognome}: ${collegamentoError.message}`);
        } else {
          console.log('✅ [createServizio] Passenger link created successfully');
        }
        console.log('───────────────────────────────────');
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
