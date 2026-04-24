import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useReports } from "./useReports";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook wrapper per clienti - filtra automaticamente i report per referente_id
 * Usa useAuth() per supportare correttamente l'impersonificazione
 */
export const useReportCliente = () => {
  const { profile, user, loading } = useAuth();

  // Get profile with azienda info (using impersonated profile id)
  const { data: profileWithAzienda, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["report-cliente-profile", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

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
        .eq("id", profile.id)
        .single();

      if (error) {
        console.error("[useReportCliente] Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!profile?.id,
  });

  // Use existing useReports hook with auto-filters for security
  const reportsHook = useReports({
    azienda_id: profile?.azienda_id,
    referente_id: profile?.id,
  });

  return {
    ...reportsHook,
    profile: profileWithAzienda,
    user,
    isLoadingProfile: loading || isLoadingProfile,
  };
};
