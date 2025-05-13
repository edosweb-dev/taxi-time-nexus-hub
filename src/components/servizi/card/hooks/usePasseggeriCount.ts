
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const usePasseggeriCount = (servizioId: string) => {
  const [passeggeriCount, setPasseggeriCount] = useState<number>(0);
  
  useEffect(() => {
    const fetchPasseggeriCount = async () => {
      const { count, error } = await supabase
        .from('passeggeri')
        .select('*', { count: 'exact', head: true })
        .eq('servizio_id', servizioId);
        
      if (error) {
        console.error('Error fetching passengers:', error);
        return;
      }
      
      setPasseggeriCount(count || 0);
    };
    
    fetchPasseggeriCount();
  }, [servizioId]);
  
  return passeggeriCount;
};
