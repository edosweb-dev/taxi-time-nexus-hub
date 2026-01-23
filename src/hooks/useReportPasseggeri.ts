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
  consegnato_a_id: string | null;
  consegnato_a_nome: string | null;
}

interface ReportFilters {
  dataInizio: string;
  dataFine: string;
  aziendaId?: string;
  referenteId?: string;
  dipendenteId?: string;
  socioId?: string;
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
          consegna_contanti_a,
          aziende:azienda_id (
            id,
            nome
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
        .order('data_servizio', { ascending: true })
        .order('orario_servizio', { ascending: true });

      if (filters.aziendaId) {
        query = query.eq('azienda_id', filters.aziendaId);
      }

      if (filters.referenteId) {
        query = query.eq('referente_id', filters.referenteId);
      }

      if (filters.dipendenteId) {
        query = query.eq('assegnato_a', filters.dipendenteId);
      }

      if (filters.socioId) {
        query = query.eq('consegna_contanti_a', filters.socioId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch referenti and consegnatari profiles in batch
      const referenteIds = [...new Set(
        data?.map(s => s.referente_id).filter(Boolean) || []
      )];
      
      const consegnatariIds = [...new Set(
        data?.map(s => s.consegna_contanti_a).filter(Boolean) || []
      )];

      let referentiMap = new Map<string, string>();
      let consegnatariMap = new Map<string, string>();
      
      const allProfileIds = [...new Set([...referenteIds, ...consegnatariIds])];
      
      if (allProfileIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', allProfileIds);
        
        profilesData?.forEach(p => {
          const fullName = `${p.first_name} ${p.last_name}`;
          if (referenteIds.includes(p.id)) {
            referentiMap.set(p.id, fullName);
          }
          if (consegnatariIds.includes(p.id)) {
            consegnatariMap.set(p.id, fullName);
          }
        });
      }

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
              referente_nome: servizio.referente_id ? referentiMap.get(servizio.referente_id) : undefined,
              stato: servizio.stato,
              consegnato_a_id: servizio.consegna_contanti_a,
              consegnato_a_nome: servizio.consegna_contanti_a ? consegnatariMap.get(servizio.consegna_contanti_a) || null : null,
            });
          });
        } else {
          // Show services without passengers
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
            referente_nome: servizio.referente_id ? referentiMap.get(servizio.referente_id) : undefined,
            stato: servizio.stato,
            consegnato_a_id: servizio.consegna_contanti_a,
            consegnato_a_nome: servizio.consegna_contanti_a ? consegnatariMap.get(servizio.consegna_contanti_a) || null : null,
          });
        }
      });

      return rows;
    },
  });
};
