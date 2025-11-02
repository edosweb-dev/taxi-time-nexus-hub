import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReportPasseggeroRow {
  servizio_id: string;
  id_progressivo: string;
  data_servizio: string;
  orario_servizio: string;
  passeggero_nome: string;
  passeggero_id: string | null;
  percorso: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  nr_passeggeri_totale: number;
  metodo_pagamento: string;
  importo: number;
  azienda_nome?: string;
  referente_nome?: string;
  stato: string;
}

interface ReportFilters {
  dataInizio: string;
  dataFine: string;
  aziendaId?: string;
  referenteId?: string;
  metodoPagamento?: string;
}

export const useReportPasseggeri = (filters: ReportFilters) => {
  return useQuery({
    queryKey: ['report-passeggeri', filters],
    queryFn: async () => {
      let query = supabase
        .from('servizi')
        .select(`
          id,
          id_progressivo,
          data_servizio,
          orario_servizio,
          indirizzo_presa,
          indirizzo_destinazione,
          citta_presa,
          citta_destinazione,
          metodo_pagamento,
          incasso_previsto,
          incasso_ricevuto,
          stato,
          azienda_id,
          referente_id,
          aziende:azienda_id (
            id,
            nome
          ),
          referente:referente_id (
            id,
            first_name,
            last_name
          ),
          servizi_passeggeri (
            id,
            passeggero_id,
            nome_cognome_inline,
            passeggeri:passeggero_id (
              id,
              nome_cognome
            )
          )
        `)
        .gte('data_servizio', filters.dataInizio)
        .lte('data_servizio', filters.dataFine)
        .order('data_servizio', { ascending: false })
        .order('orario_servizio', { ascending: false });

      if (filters.aziendaId) {
        query = query.eq('azienda_id', filters.aziendaId);
      }

      if (filters.referenteId) {
        query = query.eq('referente_id', filters.referenteId);
      }

      if (filters.metodoPagamento) {
        query = query.eq('metodo_pagamento', filters.metodoPagamento);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to flat structure
      const rows: ReportPasseggeroRow[] = [];

      data?.forEach((servizio: any) => {
        const passeggeri = servizio.servizi_passeggeri || [];
        const nrPasseggeri = passeggeri.length;

        // If there are passengers, create one row per passenger
        if (passeggeri.length > 0) {
          passeggeri.forEach((sp: any) => {
            const passeggeroNome = sp.nome_cognome_inline || sp.passeggeri?.nome_cognome || 'N/D';
            
            rows.push({
              servizio_id: servizio.id,
              id_progressivo: servizio.id_progressivo || 'N/D',
              data_servizio: servizio.data_servizio,
              orario_servizio: servizio.orario_servizio,
              passeggero_nome: passeggeroNome,
              passeggero_id: sp.passeggero_id,
              percorso: `${servizio.citta_presa || servizio.indirizzo_presa} → ${servizio.citta_destinazione || servizio.indirizzo_destinazione}`,
              indirizzo_presa: servizio.indirizzo_presa,
              indirizzo_destinazione: servizio.indirizzo_destinazione,
              nr_passeggeri_totale: nrPasseggeri,
              metodo_pagamento: servizio.metodo_pagamento,
              importo: servizio.incasso_ricevuto || servizio.incasso_previsto || 0,
              azienda_nome: servizio.aziende?.nome,
              referente_nome: servizio.referente ? `${servizio.referente.first_name} ${servizio.referente.last_name}` : undefined,
              stato: servizio.stato,
            });
          });
        } else {
          // If no passengers, create one row for the service
          rows.push({
            servizio_id: servizio.id,
            id_progressivo: servizio.id_progressivo || 'N/D',
            data_servizio: servizio.data_servizio,
            orario_servizio: servizio.orario_servizio,
            passeggero_nome: 'Nessun passeggero',
            passeggero_id: null,
            percorso: `${servizio.citta_presa || servizio.indirizzo_presa} → ${servizio.citta_destinazione || servizio.indirizzo_destinazione}`,
            indirizzo_presa: servizio.indirizzo_presa,
            indirizzo_destinazione: servizio.indirizzo_destinazione,
            nr_passeggeri_totale: 0,
            metodo_pagamento: servizio.metodo_pagamento,
            importo: servizio.incasso_ricevuto || servizio.incasso_previsto || 0,
            azienda_nome: servizio.aziende?.nome,
            referente_nome: servizio.referente ? `${servizio.referente.first_name} ${servizio.referente.last_name}` : undefined,
            stato: servizio.stato,
          });
        }
      });

      return rows;
    },
  });
};
