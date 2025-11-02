import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IncassoContante {
  servizio_id: string;
  id_progressivo: string | null;
  data_servizio: string;
  azienda_nome: string | null;
  cliente_privato_nome: string | null;
  assegnato_a_nome: string | null;
  consegnato_a_nome: string | null;
  consegnato_a_id: string | null;
  incasso_ricevuto: number | null;
  incasso_previsto: number | null;
  stato: string;
}

interface UseIncassiContantiParams {
  dataInizio: string;
  dataFine: string;
}

interface IncassiStats {
  totaleIncassi: number;
  numeroServizi: number;
}

export function useIncassiContanti({ dataInizio, dataFine }: UseIncassiContantiParams) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['incassi-contanti', dataInizio, dataFine],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servizi')
        .select(`
          id,
          id_progressivo,
          data_servizio,
          incasso_ricevuto,
          incasso_previsto,
          stato,
          consegna_contanti_a,
          azienda_id,
          cliente_privato_id,
          assegnato_a,
          aziende!servizi_azienda_id_fkey (
            nome
          ),
          assegnato:profiles!servizi_assegnato_a_fkey (
            first_name,
            last_name
          ),
          consegnato:profiles!servizi_consegna_contanti_a_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('metodo_pagamento', 'Contanti')
        .in('stato', ['completato', 'consuntivato'])
        .gte('data_servizio', dataInizio)
        .lte('data_servizio', dataFine)
        .order('data_servizio', { ascending: false });

      if (error) throw error;

      // Trasforma i dati
      const incassi: IncassoContante[] = (data || []).map((servizio: any) => {
        const assegnatoProfile = servizio.assegnato;
        const consegnatoProfile = servizio.consegnato;
        const azienda = servizio.aziende;

        // Per clienti privati, recuperiamo il nome dal campo inline
        let clientePrivatoNome = null;
        if (servizio.cliente_privato_id) {
          // TODO: se necessario, fare una query separata per recuperare il nome
          // del cliente privato dalla tabella clienti_privati
          clientePrivatoNome = 'Cliente Privato';
        }

        return {
          servizio_id: servizio.id,
          id_progressivo: servizio.id_progressivo,
          data_servizio: servizio.data_servizio,
          azienda_nome: azienda?.nome || null,
          cliente_privato_nome: clientePrivatoNome,
          assegnato_a_nome: assegnatoProfile
            ? `${assegnatoProfile.first_name || ''} ${assegnatoProfile.last_name || ''}`.trim()
            : null,
          consegnato_a_nome: consegnatoProfile
            ? `${consegnatoProfile.first_name || ''} ${consegnatoProfile.last_name || ''}`.trim()
            : null,
          consegnato_a_id: consegnatoProfile?.id || null,
          incasso_ricevuto: servizio.incasso_ricevuto,
          incasso_previsto: servizio.incasso_previsto,
          stato: servizio.stato,
        };
      });

      return incassi;
    },
    staleTime: 1000 * 60 * 2, // 2 minuti
  });

  // Calcola statistiche
  const stats: IncassiStats = {
    totaleIncassi: (data || []).reduce(
      (sum, incasso) => sum + (incasso.incasso_ricevuto || incasso.incasso_previsto || 0),
      0
    ),
    numeroServizi: (data || []).length,
  };

  // Estrai soci unici (chi ha ricevuto i contanti)
  const uniqueSoci = Array.from(
    new Map(
      (data || [])
        .filter(i => i.consegnato_a_id)
        .map(i => [i.consegnato_a_id, { id: i.consegnato_a_id!, nome: i.consegnato_a_nome! }])
    ).values()
  );

  return {
    incassi: data || [],
    isLoading,
    error,
    stats,
    uniqueSoci,
  };
}
