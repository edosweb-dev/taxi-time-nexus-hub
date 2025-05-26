
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function usePasseggeriCount(servizioId: string) {
  return useQuery({
    queryKey: ["passeggeriCount", servizioId],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("servizi_passeggeri")
        .select("*", { count: "exact" })
        .eq("servizio_id", servizioId);

      if (error) {
        throw error;
      }

      return count || 0;
    },
  });
}
