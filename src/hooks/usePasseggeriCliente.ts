import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePasseggeriCliente = (searchTerm?: string) => {
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: passeggeri, isLoading, error, refetch } = useQuery({
    queryKey: ["passeggeri-cliente", user?.id, searchTerm],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("passeggeri")
        .select(`
          id,
          nome_cognome,
          email,
          telefono,
          localita,
          indirizzo,
          created_at,
          aziende:azienda_id (
            nome
          )
        `)
        .eq("created_by_referente_id", user.id)
        .eq("tipo", "rubrica")
        .order("nome_cognome", { ascending: true });

      // Search filter
      if (searchTerm && searchTerm.length > 0) {
        query = query.ilike("nome_cognome", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("[usePasseggeriCliente] Error fetching passengers:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  return {
    passeggeri: passeggeri || [],
    isLoading,
    error,
    refetch,
  };
};
