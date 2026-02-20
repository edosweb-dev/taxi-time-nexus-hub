import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePasseggeriCliente = (aziendaId?: string | null, searchTerm?: string) => {
  const { data: passeggeri, isLoading, error, refetch } = useQuery({
    queryKey: ["passeggeri-cliente", aziendaId, searchTerm],
    queryFn: async () => {
      if (!aziendaId) {
        console.log('[usePasseggeriCliente] No azienda_id provided');
        return [];
      }

      let query = supabase
        .from("passeggeri")
        .select(`
          id,
          nome_cognome,
          email,
          telefono,
          telefono_2,
          localita,
          indirizzo,
          created_at,
          aziende:azienda_id (
            nome
          )
        `)
        .eq("azienda_id", aziendaId)
        .eq("tipo", "rubrica")
        .order("nome_cognome", { ascending: true });

      if (searchTerm && searchTerm.trim().length > 0) {
        query = query.ilike("nome_cognome", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[usePasseggeriCliente] Error fetching passengers:", error);
        throw error;
      }

      console.log(`[usePasseggeriCliente] Found ${data?.length || 0} passengers for azienda ${aziendaId}`);
      return data || [];
    },
    enabled: !!aziendaId,
  });

  return {
    passeggeri: passeggeri || [],
    isLoading,
    error,
    refetch,
  };
};
