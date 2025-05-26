
import { supabase } from '@/lib/supabase';
import { Passeggero, Servizio } from '@/lib/types/servizi';
import { CreateServizioRequest } from './types';
import { toast } from '@/components/ui/sonner';

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

    // 1. Insert servizio with new fields
    console.log('[createServizio] Inserting servizio into database');
    const { data: servizioData, error: servizioError } = await supabase
      .from('servizi')
      .insert({
        azienda_id: data.servizio.azienda_id,
        referente_id: data.servizio.referente_id,
        numero_commessa: data.servizio.numero_commessa,
        data_servizio: data.servizio.data_servizio,
        orario_servizio: data.servizio.orario_servizio,
        indirizzo_presa: data.servizio.indirizzo_presa,
        indirizzo_destinazione: data.servizio.indirizzo_destinazione,
        metodo_pagamento: data.servizio.metodo_pagamento,
        note: data.servizio.note,
        veicolo_id: data.servizio.veicolo_id,
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
    
    // Assicuriamoci che il servizio restituito sia del tipo corretto
    const servizio = servizioData as Servizio;

    // 2. Insert passeggeri
    if (data.passeggeri && data.passeggeri.length > 0) {
      const passeggeriToInsert = data.passeggeri.map(p => ({
        servizio_id: servizio.id,
        nome_cognome: p.nome_cognome,
        email: p.email,
        telefono: p.telefono,
        // Use personalized fields only when personalization is enabled
        orario_presa_personalizzato: p.usa_indirizzo_personalizzato ? p.orario_presa_personalizzato : null,
        luogo_presa_personalizzato: p.usa_indirizzo_personalizzato ? p.luogo_presa_personalizzato : null,
        destinazione_personalizzato: p.usa_indirizzo_personalizzato ? p.destinazione_personalizzato : null,
        usa_indirizzo_personalizzato: p.usa_indirizzo_personalizzato
      }));

      console.log('[createServizio] Inserting passeggeri:', passeggeriToInsert);

      const { data: passeggeri, error: passeggeriError } = await supabase
        .from('passeggeri')
        .insert(passeggeriToInsert)
        .select();

      if (passeggeriError) {
        console.error('[createServizio] Error creating passeggeri:', passeggeriError);
        // Not throwing here, we already created the servizio
        toast.error(`Errore nell'aggiunta dei passeggeri: ${passeggeriError.message}`);
      } else {
        console.log('[createServizio] Passeggeri created successfully:', passeggeri);
      }
    } else {
      console.log('[createServizio] No passeggeri to insert');
    }

    return { servizio, error: null };
  } catch (error: any) {
    console.error('[createServizio] Unexpected error:', error);
    return { servizio: null, error: error as Error };
  }
}
