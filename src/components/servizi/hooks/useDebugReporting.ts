
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDebugReporting = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const checkServizi = async (aziendaId: string, referenteId: string, month: number, year: number) => {
    if (!aziendaId || !referenteId || !month || !year) {
      return { error: 'Missing required parameters' };
    }
    
    try {
      // Calculate date range
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      
      // Format dates as YYYY-MM-DD strings for database comparison
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      console.log('Debug report - Date range:', { startDateString, endDateString });
      
      // First get referenti and aziende for context
      const { data: aziende } = await supabase
        .from('aziende')
        .select('id, nome');
        
      const { data: referenti } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('role', 'cliente');
        
      // Get all servizi for this period
      const { data: allServizi, error: allError } = await supabase
        .from('servizi')
        .select('id, data_servizio, stato')
        .eq('azienda_id', aziendaId)
        .eq('referente_id', referenteId)
        .gte('data_servizio', startDateString)
        .lte('data_servizio', endDateString);
      
      if (allError) {
        console.error('Debug report - Error fetching all servizi:', allError);
        return { error: allError.message };
      }
      
      // Get only consuntivati
      const { data: consuntivati, error: consuntivatiError } = await supabase
        .from('servizi')
        .select('id, data_servizio, stato')
        .eq('azienda_id', aziendaId)
        .eq('referente_id', referenteId)
        .eq('stato', 'consuntivato')
        .gte('data_servizio', startDateString)
        .lte('data_servizio', endDateString);
      
      if (consuntivatiError) {
        console.error('Debug report - Error fetching consuntivati:', consuntivatiError);
        return { error: consuntivatiError.message };
      }
      
      const result = {
        dateRange: { startDateString, endDateString },
        allServizi: {
          count: allServizi?.length || 0,
          items: allServizi || []
        },
        consuntivati: {
          count: consuntivati?.length || 0,
          items: consuntivati || []
        },
        statuses: allServizi?.reduce((acc: Record<string, number>, servizio) => {
          acc[servizio.stato] = (acc[servizio.stato] || 0) + 1;
          return acc;
        }, {}) || {},
        aziende,
        referenti
      };
      
      console.log('Debug report - Results:', result);
      setDebugInfo(result);
      
      return result;
    } catch (error: any) {
      console.error('Debug report - Unexpected error:', error);
      return { error: error.message };
    }
  };
  
  return {
    debugInfo,
    checkServizi
  };
};
