
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Servizio } from "@/lib/types/servizi";

/**
 * Hook to fetch passenger counts for a list of services
 */
export function usePasseggeriCounts(servizi: Servizio[]) {
  const [passeggeriCounts, setPasseggeriCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchPasseggeriCounts = async () => {
      if (servizi.length === 0) return;
      
      setIsLoading(true);
      const servizioIds = servizi.map(s => s.id);
      
      const { data, error } = await supabase
        .from('passeggeri')
        .select('servizio_id')
        .in('servizio_id', servizioIds);
        
      if (error) {
        console.error('Error fetching passengers:', error);
        setIsLoading(false);
        return;
      }
      
      // Count passengers per service
      const counts: Record<string, number> = {};
      data?.forEach(p => {
        counts[p.servizio_id] = (counts[p.servizio_id] || 0) + 1;
      });
      
      setPasseggeriCounts(counts);
      setIsLoading(false);
    };
    
    fetchPasseggeriCounts();
  }, [servizi]);

  return { 
    passeggeriCounts, 
    isLoading,
    getCount: (servizioId: string) => passeggeriCounts[servizioId] || 0 
  };
}
