
import { useState } from 'react';
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
  
  // Function to fetch servizi based on filters
  const fetchServizi = async (
    aziendaId: string, 
    referenteId: string, 
    month: number, 
    year: number
  ): Promise<Servizio[]> => {
    if (!aziendaId || !referenteId || !month || !year) {
      console.log('Missing required filter params:', { aziendaId, referenteId, month, year });
      return [];
    }
    
    // Get first and last day of month - proper date range calculation
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    // Format dates as YYYY-MM-DD strings for database comparison
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
    
    console.log('Fetching consuntivati servizi with date range:', {
      startDate: startDateString,
      endDate: endDateString,
      aziendaId: aziendaId,
      referenteId: referenteId
    });
    
    // First fetch all servizi regardless of status to debug
    const { data: allServizi, error: allServiziError } = await supabase
      .from('servizi')
      .select('*')
      .eq('azienda_id', aziendaId)
      .eq('referente_id', referenteId)
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
      .eq('azienda_id', aziendaId)
      .eq('referente_id', referenteId)
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
  };
  
  // Function to generate PDF report - MODIFIED to fetch data directly
  const generateReport = async (params: GenerateReportParams) => {
    try {
      console.log('Generating report with params:', params);
      
      // Validate required params
      if (!params.aziendaId || !params.referenteId || !params.month || !params.year || !params.serviziIds || params.serviziIds.length === 0) {
        toast({
          title: 'Parametri mancanti',
          description: 'Verifica di aver selezionato tutti i parametri necessari e almeno un servizio.',
          variant: 'destructive',
        });
        return null;
      }
      
      // Update filter params for the UI state
      setFilterParams({
        aziendaId: params.aziendaId,
        referenteId: params.referenteId,
        month: params.month,
        year: params.year
      });
      
      console.log('Calling edge function with serviziIds:', params.serviziIds.length);
      
      // Call Edge Function to generate PDF with the servizi IDs
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: params
      });
      
      if (error) {
        console.error('Error generating report:', error);
        toast({
          title: 'Errore',
          description: 'Si è verificato un errore nella generazione del report: ' + 
            (error.message || 'Verifica i permessi di storage su Supabase'),
          variant: 'destructive',
        });
        throw error;
      }
      
      console.log("Report generato con successo:", data);
      
      toast({
        title: 'Report generato',
        description: 'Il report è stato generato con successo.',
      });
      
      return data;
      
    } catch (error: any) {
      console.error('Unexpected error generating report:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore nella generazione del report. ' + 
          (error.message || 'Potrebbe essere un problema di permessi o di configurazione del bucket di storage.'),
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  return {
    fetchServizi,
    generateReport,
    setFilterParams,
  };
};
