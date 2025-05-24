
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
    // Validazione parametri
    if (!aziendaId) {
      console.error('Invalid aziendaId:', aziendaId);
      toast({
        title: 'Parametro mancante',
        description: 'ID azienda non valido',
        variant: 'destructive',
      });
      return [];
    }
    
    if (!referenteId) {
      console.error('Invalid referenteId:', referenteId);
      toast({
        title: 'Parametro mancante',
        description: 'ID referente non valido',
        variant: 'destructive',
      });
      return [];
    }
    
    if (!month || month < 1 || month > 12) {
      console.error('Invalid month:', month);
      toast({
        title: 'Parametro mancante',
        description: 'Mese non valido (deve essere tra 1 e 12)',
        variant: 'destructive',
      });
      return [];
    }
    
    if (!year || year < 2000 || year > 2100) {
      console.error('Invalid year:', year);
      toast({
        title: 'Parametro mancante',
        description: 'Anno non valido',
        variant: 'destructive',
      });
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
    
    // First fetch all servizi regardless of status for debugging
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
      toast({
        title: 'Errore',
        description: `Errore nel recupero dei servizi: ${allServiziError.message}`,
        variant: 'destructive',
      });
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
      toast({
        title: 'Errore',
        description: `Errore nel recupero dei servizi consuntivati: ${error.message}`,
        variant: 'destructive',
      });
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
  
  // Function to generate PDF report
  const generateReport = async (params: GenerateReportParams) => {
    try {
      console.log('Generazione report con parametri:', params);
      
      // Validazione parametri
      if (!params.aziendaId) {
        const errorMessage = 'ID azienda mancante';
        console.error(errorMessage);
        toast({
          title: 'Parametro mancante',
          description: errorMessage,
          variant: 'destructive',
        });
        return null;
      }
      
      if (!params.referenteId) {
        const errorMessage = 'ID referente mancante';
        console.error(errorMessage);
        toast({
          title: 'Parametro mancante',
          description: errorMessage,
          variant: 'destructive',
        });
        return null;
      }
      
      if (!params.month || params.month < 1 || params.month > 12) {
        const errorMessage = 'Mese non valido (deve essere tra 1 e 12)';
        console.error(errorMessage, params.month);
        toast({
          title: 'Parametro mancante',
          description: errorMessage,
          variant: 'destructive',
        });
        return null;
      }
      
      if (!params.year || params.year < 2000 || params.year > 2100) {
        const errorMessage = 'Anno non valido';
        console.error(errorMessage, params.year);
        toast({
          title: 'Parametro mancante',
          description: errorMessage,
          variant: 'destructive',
        });
        return null;
      }
      
      if (!params.serviziIds || params.serviziIds.length === 0) {
        const errorMessage = 'Nessun servizio selezionato';
        console.error(errorMessage);
        toast({
          title: 'Parametro mancante',
          description: 'Verifica di aver selezionato almeno un servizio.',
          variant: 'destructive',
        });
        return null;
      }
      
      if (!params.createdBy) {
        const errorMessage = 'ID utente creatore mancante';
        console.error(errorMessage);
        toast({
          title: 'Parametro mancante',
          description: errorMessage,
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
      
      console.log('Chiamata a edge function con serviziIds:', params.serviziIds.length);
      
      // Mostra toast di generazione in corso
      toast({
        title: 'Generazione in corso',
        description: 'Generazione del report PDF in corso...',
      });
      
      // Call Edge Function to generate PDF with the servizi IDs and bucket name
      console.log('Invio richiesta a edge function generate-report...');
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          ...params,
          bucketName: 'report_aziende' // Use the fixed bucket name
        }
      });
      
      console.log('Risposta da edge function ricevuta:', { data, error });
      
      if (error) {
        console.error('Errore dalla edge function:', error);
        
        // Gestione errori specifici
        if (error.message?.includes('bucket')) {
          toast({
            title: 'Errore di storage',
            description: 'Problema con il sistema di archiviazione. Contatta l\'amministratore.',
            variant: 'destructive',
          });
        } else if (error.message?.includes('permission')) {
          toast({
            title: 'Errore di permessi',
            description: 'Non hai i permessi necessari per generare il report.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Errore nella generazione',
            description: error.message || 'Si è verificato un errore durante la generazione del report',
            variant: 'destructive',
          });
        }
        throw error;
      }
      
      if (!data) {
        const errorMessage = 'La edge function non ha restituito dati';
        console.error(errorMessage);
        toast({
          title: 'Errore',
          description: 'La edge function non ha restituito dati. Controlla i log della edge function.',
          variant: 'destructive',
        });
        throw new Error(errorMessage);
      }
      
      if (data.error) {
        console.error('Errore restituito dalla edge function:', data.error);
        toast({
          title: 'Errore',
          description: 'Si è verificato un errore nella generazione del report: ' + data.error,
          variant: 'destructive',
        });
        throw new Error(data.error);
      }
      
      console.log("Report generato con successo:", data);
      
      toast({
        title: 'Report generato',
        description: 'Il report è stato generato con successo.',
      });
      
      return data;
      
    } catch (error: any) {
      console.error('Errore imprevisto nella generazione report:', error);
      
      // Toast di fallback per errori non gestiti
      if (!error.message?.includes('bucket') && !error.message?.includes('permission')) {
        toast({
          title: 'Errore',
          description: error?.message || 'Si è verificato un errore imprevisto nella generazione del report.',
          variant: 'destructive',
        });
      }
      throw error;
    }
  };
  
  return {
    fetchServizi,
    generateReport,
    setFilterParams
  };
};
