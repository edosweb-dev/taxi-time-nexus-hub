import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StatoServizio = 
  | "da_assegnare" 
  | "assegnato" 
  | "completato" 
  | "consuntivato" 
  | "bozza" 
  | "annullato";

export const useServiziCliente = (statoFilter?: StatoServizio | null) => {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: servizi, isLoading, error, refetch } = useQuery({
    queryKey: ["servizi-cliente", user?.id, statoFilter],
    queryFn: async () => {
      if (!user?.id) return [];

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
        `)
        .eq("referente_id", user.id)
        .order("data_servizio", { ascending: false })
        .order("created_at", { ascending: false });

      // Filtro per stato se specificato
      if (statoFilter) {
        query = query.eq("stato", statoFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Errore fetch servizi cliente:", error);
        throw error;
      }

      return data || [];
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

  return {
    servizi: servizi || [],
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
