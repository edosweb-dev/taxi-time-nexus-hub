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
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: servizi, isLoading, error, refetch } = useQuery({
    queryKey: ["servizi-cliente", user?.id, statoFilter, filtri, page],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };

      // Calcola offset per pagination
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
          indirizzo_destinazione,
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
        .eq("referente_id", user.id)
        .order("data_servizio", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      // Filtro per stato se specificato
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
    enabled: !!user?.id,
  });

  // Conta servizi per ogni stato (per badge tabs)
  const { data: counts } = useQuery({
    queryKey: ["servizi-cliente-counts", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

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
          .eq("referente_id", user.id)
          .eq("stato", stato);
        
        return { stato, count: count || 0 };
      });

      const results = await Promise.all(countPromises);
      
      return results.reduce((acc, { stato, count }) => {
        acc[stato] = count;
        return acc;
      }, {} as Record<StatoServizio, number>);
    },
    enabled: !!user?.id,
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
