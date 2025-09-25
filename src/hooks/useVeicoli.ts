import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useVeicoli() {
  const { data: veicoli, isLoading, error, refetch } = useQuery({
    queryKey: ['veicoli'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veicoli')
        .select('*')
        .eq('attivo', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  return {
    veicoli,
    isLoading,
    error,
    refetch
  };
}

export const useVeicoliAttivi = useVeicoli;