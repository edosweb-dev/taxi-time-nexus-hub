
import { supabase } from '@/lib/supabase';
import { sendEmailNotification } from '@/lib/api/email/sendNotification';
import { MetodoPagamento } from '@/lib/types/servizi';
import { getTipoPagamento, TipoPagamento } from '@/lib/types/servizi/metodoPagamentoHelpers';

interface CompletaServizioParams {
  id: string;
  metodo_pagamento: MetodoPagamento;
  incasso_ricevuto?: number;
  consegna_contanti_a?: string;
}

export async function completaServizio({
  id,
  metodo_pagamento,
  incasso_ricevuto,
  consegna_contanti_a,
}: CompletaServizioParams) {
  try {
    const tipoPagamento = getTipoPagamento(metodo_pagamento);
    
    // Validazione condizionale basata sul tipo di pagamento
    if (tipoPagamento === TipoPagamento.CONTANTI_UBER || tipoPagamento === TipoPagamento.CARTA) {
      if (incasso_ricevuto === undefined || incasso_ricevuto === null) {
        throw new Error(
          `Incasso ricevuto obbligatorio per pagamenti con ${metodo_pagamento}`
        );
      }
    }
    
    // consegna_contanti_a gestito in fase di consuntivazione

    const updateData: any = {
      stato: 'completato',
      metodo_pagamento,
    };

    // Aggiungi campi incasso SOLO se metodo lo richiede (escludi Bonifico)
    if (tipoPagamento === TipoPagamento.CONTANTI_UBER) {
      updateData.incasso_ricevuto = incasso_ricevuto;
      updateData.consegna_contanti_a = consegna_contanti_a || null;
    } else if (tipoPagamento === TipoPagamento.CARTA) {
      updateData.incasso_ricevuto = incasso_ricevuto;
    }
    // Per bonifici: incasso_ricevuto rimane NULL (popolato in consuntivazione)

    const { data, error } = await supabase
      .from('servizi')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    // 📧 Notifica email. Sta QUI e non nei chiamanti perche' questo e' l'unico
    // punto che tutti attraversano: CompletaCartaForm, CompletaBonificoDialog,
    // CompletaContantiUberForm, useCompletaServizioForm e useCompletaServizio
    // chiamano tutti questa funzione. La chiamata che esisteva in
    // useServizi.ts:149 non e' mai stata raggiunta, perche' nessun componente
    // usa quella mutation: 798 servizi risultano 'completato' in produzione e
    // servizio_completato non ha mai prodotto una sola email.
    //
    // L'invio e' atteso, non fire-and-forget: uno dei chiamanti
    // (pages/dipendente/CompletaServizioPage.tsx) naviga subito dopo, e la
    // stessa corsa ha fatto perdere il 37% delle notifiche di richiesta cliente
    // a luglio (vedi il commento in pages/cliente/NuovoServizioPage.tsx). Il
    // tetto di 6 secondi evita che un guasto del trasporto blocchi l'interfaccia.
    // sendEmailNotification non lancia mai, quindi il completamento non puo'
    // fallire per colpa dell'email.
    await Promise.race([
      sendEmailNotification(id, 'servizio_completato'),
      new Promise(resolve => setTimeout(resolve, 6000)),
    ]);

    return { data, error: null };
  } catch (error: any) {
    console.error('[completaServizio] Error:', error);
    return { data: null, error };
  }
}
