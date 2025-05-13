
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Servizio } from '@/lib/types/servizi';
import { toast } from '@/components/ui/use-toast';

type GenerateReportParams = {
  aziendaId: string;
  referenteId: string;
  month: number;
  year: number;
  serviziIds: string[];
  createdBy: string;
};

export const useGenerateReport = () => {
  const [filterParams, setFilterParams] = useState<{
    aziendaId?: string;
    referenteId?: string;
    month?: number;
    year?: number;
  }>({});
  
  // Query to fetch consuntivati servizi based on filters
  const { data: servizi = [], isLoading: isLoadingServizi } = useQuery({
    queryKey: ['servizi', 'consuntivati', filterParams],
    queryFn: async () => {
      if (!filterParams.aziendaId || !filterParams.referenteId || !filterParams.month || !filterParams.year) {
        return [];
      }
      
      // Get first and last day of month - proper date range calculation
      const startDate = new Date(filterParams.year, filterParams.month - 1, 1);
      const endDate = new Date(filterParams.year, filterParams.month, 0); // Last day of the month
      
      // Format dates as YYYY-MM-DD strings for database comparison
      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = endDate.toISOString().split('T')[0];
      
      console.log('Fetching consuntivati servizi with date range:', {
        startDate: startDateString,
        endDate: endDateString,
        aziendaId: filterParams.aziendaId,
        referenteId: filterParams.referenteId
      });
      
      // First fetch all servizi regardless of status to debug
      const { data: allServizi, error: allServiziError } = await supabase
        .from('servizi')
        .select('*')
        .eq('azienda_id', filterParams.aziendaId)
        .eq('referente_id', filterParams.referenteId)
        .gte('data_servizio', startDateString)
        .lte('data_servizio', endDateString)
        .order('data_servizio', { ascending: true });
        
      if (allServiziError) {
        console.error('Error fetching all servizi:', allServiziError);
        return [];
      }
      
      console.log('Servizi totali trovati:', allServizi?.length || 0);
      console.log('Date dei servizi trovati:', allServizi?.map(s => s.data_servizio));
      console.log('Filtrati consuntivati:', allServizi?.filter(s => s.stato === 'consuntivato').length || 0);
      
      // Now fetch only consuntivati for the actual data
      const { data, error } = await supabase
        .from('servizi')
        .select('*')
        .eq('azienda_id', filterParams.aziendaId)
        .eq('referente_id', filterParams.referenteId)
        .eq('stato', 'consuntivato') // Explicitly filter only "consuntivato" status
        .gte('data_servizio', startDateString) // Use the formatted string for proper comparison
        .lte('data_servizio', endDateString)
        .order('data_servizio', { ascending: true });
        
      if (error) {
        console.error('Error fetching consuntivati servizi:', error);
        return [];
      }
      
      console.log('Retrieved consuntivati servizi count:', data?.length || 0);
      
      // Log details of each servizio to verify data format
      if (data && data.length > 0) {
        console.log('Sample servizio data format:', {
          id: data[0].id,
          data_servizio: data[0].data_servizio,
          stato: data[0].stato,
          azienda_id: data[0].azienda_id,
          referente_id: data[0].referente_id
        });
      } else {
        console.log('No consuntivati servizi found with current filters');
      }
      
      return data as Servizio[];
    },
    enabled: !!(filterParams.aziendaId && filterParams.referenteId && filterParams.month && filterParams.year),
  });
  
  // Watch for form changes to update filter params
  useEffect(() => {
    const { aziendaId, referenteId, month, year } = filterParams;
    if (aziendaId && referenteId && month && year) {
      console.log('Fetching servizi with filters:', filterParams);
    }
  }, [filterParams]);
  
  // Function to generate PDF report
  const generateReport = async (params: GenerateReportParams) => {
    try {
      // Set filter params to get servizi
      setFilterParams({
        aziendaId: params.aziendaId,
        referenteId: params.referenteId,
        month: params.month,
        year: params.year
      });
      
      console.log('Generating report with params:', params);
      console.log('Selected servizi IDs:', params.serviziIds);
      
      // Call Edge Function to generate PDF
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: params
      });
      
      if (error) {
        console.error('Error generating report:', error);
        toast({
          title: 'Errore',
          description: 'Si è verificato un errore nella generazione del report.',
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Report generato',
        description: 'Il report è stato generato con successo.',
      });
      
      return data;
      
    } catch (error) {
      console.error('Unexpected error generating report:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore nella generazione del report.',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  return {
    servizi,
    isLoadingServizi,
    setFilterParams,
    generateReport,
  };
};
