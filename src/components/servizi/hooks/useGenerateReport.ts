
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
      
      // Get first and last day of month
      const startDate = new Date(filterParams.year, filterParams.month - 1, 1);
      const endDate = new Date(filterParams.year, filterParams.month, 0);
      
      const { data, error } = await supabase
        .from('servizi')
        .select('*')
        .eq('azienda_id', filterParams.aziendaId)
        .eq('referente_id', filterParams.referenteId)
        .eq('stato', 'consuntivato')
        .gte('data_servizio', startDate.toISOString().split('T')[0])
        .lte('data_servizio', endDate.toISOString().split('T')[0]);
        
      if (error) {
        console.error('Error fetching consuntivati servizi:', error);
        return [];
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
