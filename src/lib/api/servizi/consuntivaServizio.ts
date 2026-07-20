
import { supabase } from '@/lib/supabase';
import { sendEmailNotification } from '@/lib/api/email/sendNotification';
import { ricalcolaStipendioPerServizio } from '@/lib/api/stipendi/ricalcolaStipendio';

interface ConsuntivaServizioParams {
  id: string;
  incasso_ricevuto?: number;
  ore_effettive?: number;
  ore_sosta?: number;
  ore_attesa_socio?: number;
  consegna_contanti_a?: string;
  km_totali?: number;
}

export async function consuntivaServizio({
  id,
  incasso_ricevuto,
  ore_effettive,
  ore_sosta,
  ore_attesa_socio,
  consegna_contanti_a,
  km_totali,
}: ConsuntivaServizioParams) {
  try {
    const { data, error } = await supabase
      .from('servizi')
      .update({
        stato: 'consuntivato',
        incasso_ricevuto,
        ore_effettive,
        ore_sosta,
        ore_attesa_socio,
        consegna_contanti_a,
        km_totali,
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    // 📧 Notifica email. Stesso ragionamento di completaServizio: e' il punto di
    // convergenza di ConsuntivaServizioDialog, ConsuntivaServizioSheet e
    // useConsuntivaServizioForm. La chiamata in useServizi.ts:171 non e' mai
    // stata raggiunta: 230 servizi risultano 'consuntivato' in produzione e
    // servizio_consuntivato non ha mai prodotto una sola email.
    // Notifica e ricalcolo stipendio in parallelo, per lo stesso motivo
    // spiegato in completaServizio.ts. Qui il ricalcolo conta ancora di piu':
    // e' la consuntivazione a valorizzare ore_attesa_socio, cioe' proprio il
    // campo che alimenta lo stipendio del socio.
    await Promise.all([
      Promise.race([
        sendEmailNotification(id, 'servizio_consuntivato'),
        new Promise(resolve => setTimeout(resolve, 6000)),
      ]),
      ricalcolaStipendioPerServizio(data?.[0]),
    ]);

    return { data, error: null };
  } catch (error: any) {
    console.error('[consuntivaServizio] Error:', error);
    return { data: null, error };
  }
}
