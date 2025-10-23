import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CompensiServiziResult {
  compensiKm: number;
  compensiOre: number;
  contanti: number;
  totaleServizi: number;
}

export function useCompensiServizi(
  userId: string | undefined,
  mese: number,
  anno: number,
  enabled: boolean = true
) {
  const primoGiornoMese = new Date(anno, mese - 1, 1).toISOString().split('T')[0];
  const ultimoGiornoMese = new Date(anno, mese, 0).toISOString().split('T')[0];

  return useQuery<CompensiServiziResult>({
    queryKey: ['compensi-servizi', userId, mese, anno],
    queryFn: async () => {
      if (!userId) {
        return { compensiKm: 0, compensiOre: 0, contanti: 0, totaleServizi: 0 };
      }

      // Fetch servizi
      const { data: servizi, error: serviziError } = await supabase
        .from('servizi')
        .select('id, km_totali, ore_sosta, metodo_pagamento, incasso_ricevuto, incasso_previsto')
        .eq('assegnato_a', userId)
        .in('stato', ['completato', 'consuntivato'])
        .gte('data_servizio', primoGiornoMese)
        .lte('data_servizio', ultimoGiornoMese);

      if (serviziError) throw serviziError;
      if (!servizi || servizi.length === 0) {
        return { compensiKm: 0, compensiOre: 0, contanti: 0, totaleServizi: 0 };
      }

      // Fetch configurazione
      const { data: configurazione } = await supabase
        .from('configurazione_stipendi')
        .select('*')
        .eq('anno', anno)
        .single();

      // Fetch tariffe KM
      const { data: tariffeKm } = await supabase
        .from('tariffe_km_fissi')
        .select('*')
        .eq('anno', anno)
        .eq('attivo', true)
        .order('km', { ascending: true });

      const coefficienteAumento = Number(configurazione?.coefficiente_aumento) || 1.17;
      const tariffaOrariaAttesa = Number(configurazione?.tariffa_oraria_attesa) || 15.0;
      const tariffaOltre200 = Number(configurazione?.tariffa_oltre_200km) || 0.25;

      // Funzioni di calcolo (identiche a StipendiDettaglioPage)
      const calcolaCompensoKmServizio = (km: number): number => {
        if (km <= 200) {
          let kmArr = km;
          if (km > 12) {
            kmArr = Math.round(km / 5) * 5;
          } else if (km < 12) {
            kmArr = 12;
          }
          
          const tariffa = tariffeKm?.find(t => t.km === kmArr);
          const baseKm = Number(tariffa?.importo_base) || 0;
          
          return baseKm * coefficienteAumento;
        } else {
          const baseKm = km * tariffaOltre200;
          return baseKm * coefficienteAumento;
        }
      };

      const calcolaCompensoOreSosta = (ore: number): number => {
        return ore * tariffaOrariaAttesa;
      };

      // Calcola totali
      const totali = servizi.reduce((acc, servizio) => {
        const km = Number(servizio.km_totali) || 0;
        const ore = Number(servizio.ore_sosta) || 0;
        const compensoKm = calcolaCompensoKmServizio(km);
        const compensoOre = calcolaCompensoOreSosta(ore);
        const incasso = Number(servizio.incasso_ricevuto) || Number(servizio.incasso_previsto) || 0;
        const contanti = servizio.metodo_pagamento === 'Contanti' ? incasso : 0;

        return {
          compensiKm: acc.compensiKm + compensoKm,
          compensiOre: acc.compensiOre + compensoOre,
          contanti: acc.contanti + contanti,
          totaleServizi: acc.totaleServizi + (compensoKm + compensoOre)
        };
      }, { compensiKm: 0, compensiOre: 0, contanti: 0, totaleServizi: 0 });

      return totali;
    },
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
