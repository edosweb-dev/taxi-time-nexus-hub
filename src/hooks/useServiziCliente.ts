import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StatoServizio = 
  | "da_assegnare" 
  | "assegnato" 
  | "completato" 
  | "consuntivato" 
  | "bozza" 
  | "annullato";

export interface FiltriServizi {
  dataInizio?: string;
  dataFine?: string;
  numeroCommessa?: string;
  metodoPagamento?: string;
}

const ITEMS_PER_PAGE = 20;

export const useServiziCliente = (
  statoFilter?: StatoServizio | null,
  filtri?: FiltriServizi,
  page: number = 1
) => {
  // Fetch user profile with azienda_id
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile-cliente"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, azienda_id")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Errore fetch profilo cliente:", error);
        return null;
      }
      return data;
    },
  });

  const aziendaId = userProfile?.azienda_id;
  const userId = userProfile?.id;

  const { data: servizi, isLoading, error, refetch } = useQuery({
    queryKey: ["servizi-cliente", aziendaId, statoFilter, filtri, page],
    queryFn: async () => {
      if (!aziendaId) return { data: [], count: 0 };

      const from = (page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("servizi")
        .select(`
          id,
          id_progressivo,
          data_servizio,
          orario_servizio,
          indirizzo_presa,
          citta_presa,
          indirizzo_destinazione,
          citta_destinazione,
          stato,
          numero_commessa,
          metodo_pagamento,
          created_at,
          aziende:azienda_id (
            nome
          ),
          conducente:profiles!servizi_assegnato_a_fkey (
            first_name,
            last_name
          )
        `, { count: "exact" })
        .eq("azienda_id", aziendaId)
        .order("data_servizio", { ascending: false })
        .order("orario_servizio", { ascending: false })
        .range(from, to);

      if (statoFilter) {
        query = query.eq("stato", statoFilter);
      }

      // Filtri avanzati
      if (filtri?.dataInizio) {
        query = query.gte("data_servizio", filtri.dataInizio);
      }
      if (filtri?.dataFine) {
        query = query.lte("data_servizio", filtri.dataFine);
      }
      if (filtri?.numeroCommessa) {
        query = query.ilike("numero_commessa", `%${filtri.numeroCommessa}%`);
      }
      if (filtri?.metodoPagamento) {
        query = query.eq("metodo_pagamento", filtri.metodoPagamento);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Errore fetch servizi cliente:", error);
        throw error;
      }

      return { data: data || [], count: count || 0 };
    },
    enabled: !!aziendaId,
  });

  // Conta servizi per ogni stato (per badge tabs)
  const { data: counts } = useQuery({
    queryKey: ["servizi-cliente-counts", aziendaId],
    queryFn: async () => {
      if (!aziendaId) return null;

      const stati: StatoServizio[] = [
        "da_assegnare",
        "assegnato", 
        "completato",
        "consuntivato",
        "bozza",
        "annullato",
      ];

      const countPromises = stati.map(async (stato) => {
        const { count } = await supabase
          .from("servizi")
          .select("*", { count: "exact", head: true })
          .eq("azienda_id", aziendaId)
          .eq("stato", stato);
        
        return { stato, count: count || 0 };
      });

      const results = await Promise.all(countPromises);
      
      return results.reduce((acc, { stato, count }) => {
        acc[stato] = count;
        return acc;
      }, {} as Record<StatoServizio, number>);
    },
    enabled: !!aziendaId,
  });

  const totalPages = Math.ceil((servizi?.count || 0) / ITEMS_PER_PAGE);

  return {
    servizi: servizi?.data || [],
    totalCount: servizi?.count || 0,
    totalPages,
    currentPage: page,
    isLoading,
    error,
    refetch,
    counts: counts || {
      da_assegnare: 0,
      assegnato: 0,
      completato: 0,
      consuntivato: 0,
      bozza: 0,
      annullato: 0,
    },
  };
};
