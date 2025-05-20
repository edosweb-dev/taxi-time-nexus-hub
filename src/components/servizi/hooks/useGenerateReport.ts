
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
  
  // Funzione migliorata per verificare il bucket con test di accesso
  const checkBucketExists = async (): Promise<boolean> => {
    try {
      console.log('Verificando esistenza e permessi bucket report_aziende...');
      
      // Prima verifichiamo se il bucket esiste nella lista
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Errore nella verifica dei bucket:', bucketsError);
        toast({
          title: 'Errore',
          description: `Errore nel verificare i bucket di storage: ${bucketsError.message}`,
          variant: 'destructive',
        });
        return false;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === 'report_aziende');
      console.log('Verifica bucket report_aziende:', bucketExists ? 'TROVATO' : 'NON trovato');
      
      // Se non esiste nella lista, esce subito
      if (!bucketExists) {
        console.error('Il bucket "report_aziende" non esiste');
        toast({
          title: 'Errore di configurazione',
          description: 'Il bucket di storage "report_aziende" non esiste. Contattare l\'amministratore per crearlo.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Anche se il bucket esiste, verifichiamo che possiamo elencare i file (test permessi)
      console.log('Verificando permessi di accesso al bucket...');
      const { error: accessError } = await supabase.storage
        .from('report_aziende')
        .list();
        
      if (accessError) {
        console.error('Errore nell\'accesso al bucket (permessi insufficienti):', accessError);
        toast({
          title: 'Errore di permessi',
          description: `Non hai i permessi necessari per accedere al bucket report_aziende: ${accessError.message}`,
          variant: 'destructive',
        });
        return false;
      }
      
      console.log('Bucket report_aziende esiste e i permessi sono corretti');
      return true;
    } catch (error: any) {
      console.error('Errore imprevisto nella verifica del bucket:', error);
      toast({
        title: 'Errore',
        description: `Errore nella verifica del bucket di storage: ${error.message}`,
        variant: 'destructive',
      });
      return false;
    }
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
      
      // Check if bucket exists and we have permissions
      console.log('Verifica esistenza bucket e permessi...');
      const bucketExists = await checkBucketExists();
      if (!bucketExists) {
        return null; // Already showed toast in checkBucketExists
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
      
      // Call Edge Function to generate PDF with the servizi IDs
      console.log('Invio richiesta a edge function generate-report...');
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: params
      });
      
      console.log('Risposta da edge function ricevuta:', { data, error });
      
      if (error) {
        console.error('Errore dalla edge function:', error);
        toast({
          title: 'Errore',
          description: 'Si è verificato un errore nella generazione del report: ' + 
            (error.message || 'Verifica i permessi di storage su Supabase'),
          variant: 'destructive',
        });
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
    checkBucketExists
  };
};
