
import { supabase } from '@/lib/supabase';
import { Passeggero, Servizio } from '@/lib/types/servizi';
import { CreateServizioRequest } from './types';
import { toast } from '@/components/ui/sonner';

export async function createServizio(data: CreateServizioRequest): Promise<{ servizio: Servizio | null; error: Error | null }> {
  try {
    console.log('[createServizio] Creating servizio with data:', JSON.stringify(data, null, 2));

    // Get current user session for created_by field
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      throw new Error('Utente non autenticato');
    }

    const userId = sessionData.session.user.id;

    // 1. Insert servizio
    const { data: servizioData, error: servizioError } = await supabase
      .from('servizi')
      .insert({
        azienda_id: data.servizio.azienda_id,
        referente_id: data.servizio.referente_id,
        numero_commessa: data.servizio.numero_commessa,
        data_servizio: data.servizio.data_servizio,
        metodo_pagamento: data.servizio.metodo_pagamento,
        note: data.servizio.note,
        created_by: userId
      })
      .select()
      .single();

    if (servizioError) {
      console.error('[createServizio] Error creating servizio:', servizioError);
      throw new Error(`Errore nella creazione del servizio: ${servizioError.message}`);
    }

    if (!servizioData) {
      throw new Error('Errore nella creazione del servizio: nessun dato restituito');
    }

    console.log('[createServizio] Servizio created:', servizioData);
    
    // Assicuriamoci che il servizio restituito sia del tipo corretto
    const servizio: Servizio = servizioData as Servizio;

    // 2. Insert passeggeri
    if (data.passeggeri.length > 0) {
      const passeggeriToInsert = data.passeggeri.map(p => ({
        servizio_id: servizio.id,
        nome_cognome: p.nome_cognome,
        email: p.email,
        telefono: p.telefono,
        orario_presa: p.orario_presa,
        luogo_presa: p.luogo_presa,
        usa_indirizzo_personalizzato: p.usa_indirizzo_personalizzato,
        destinazione: p.destinazione
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
        console.log('[createServizio] Passeggeri created:', passeggeri);
      }
    }

    return { servizio, error: null };
  } catch (error) {
    console.error('[createServizio] Unexpected error:', error);
    return { servizio: null, error: error as Error };
  }
}
