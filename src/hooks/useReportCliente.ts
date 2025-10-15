import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useReports } from "./useReports";

/**
 * Hook wrapper per clienti - filtra automaticamente i report per referente_id
 * Riutilizza la logica di useReports ma con auto-filter per sicurezza
 */
export const useReportCliente = () => {
  // Get current authenticated user
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Get user profile with azienda info
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["current-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          azienda_id,
          aziende (
            id,
            nome
          )
        `)
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("[useReportCliente] Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Use existing useReports hook with auto-filters for security
  const reportsHook = useReports({
    referente_id: user?.id,        // Auto-filter: solo report del referente
    azienda_id: profile?.azienda_id, // Auto-filter: solo report dell'azienda
  });

  return {
    ...reportsHook,
    profile,
    user,
    isLoadingProfile,
  };
};
