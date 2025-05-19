
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types/index';
import { toast } from '@/components/ui/use-toast';

/**
 * Deletes a report file by ID
 */
export const deleteReportFile = async (reportId: string, reports: Report[]): Promise<string> => {
  console.log('[deleteReportFile] INIZIO con reportId:', reportId);
  console.log('[deleteReportFile] Reports disponibili:', reports.length);
  
  // Find the report
  const report = reports.find(r => r.id === reportId);
  if (!report) {
    console.error('[deleteReportFile] Report not found for ID:', reportId);
    throw new Error('Report non trovato');
  }

  console.log('[deleteReportFile] Report trovato:', report);
  console.log('[deleteReportFile] Eliminazione file da storage:', report.file_path);
  
  try {
    // Show deletion in progress toast
    toast({
      title: "Eliminazione in corso",
      description: "Eliminazione del report in corso..."
    });
    
    // First, delete the file from storage
    console.log('[deleteReportFile] Tentativo eliminazione file da bucket:', report.file_path);
    const { data: storageData, error: storageError } = await supabase.storage
      .from('report_aziende')
      .remove([report.file_path]);
      
    console.log('[deleteReportFile] Storage remove result:', storageData);
      
    if (storageError) {
      console.error('[deleteReportFile] Errore eliminazione file da storage:', storageError);
      console.error('[deleteReportFile] Messaggio errore:', storageError.message);
      // Rimuoviamo il riferimento a storageError.code che non esiste
      
      toast({
        title: "Errore storage",
        description: `Impossibile eliminare il file report: ${storageError.message}`,
        variant: "destructive",
      });
      throw storageError;
    }
    
    // Then, delete the report record from the database
    console.log('[deleteReportFile] Tentativo eliminazione record da database:', reportId);
    console.log('[deleteReportFile] Parametri query:', { id: reportId });
    
    const { data: dbData, error: dbError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .select();
      
    console.log('[deleteReportFile] DB delete result:', dbData);
    console.log('[deleteReportFile] DB delete response status:', dbData ? 'success' : 'empty data');
      
    if (dbError) {
      console.error('[deleteReportFile] Errore eliminazione record dal database:', dbError);
      console.error('[deleteReportFile] Codice errore DB:', dbError.code);
      console.error('[deleteReportFile] Messaggio errore DB:', dbError.message);
      console.error('[deleteReportFile] Dettagli errore DB:', dbError.details);
      
      toast({
        title: "Errore database",
        description: `Impossibile eliminare il record del report: ${dbError.message}`,
        variant: "destructive",
      });
      throw dbError;
    }
    
    if (!dbData || dbData.length === 0) {
      console.warn('[deleteReportFile] Record eliminato ma nessun dato restituito');
    }
    
    console.log('[deleteReportFile] Report eliminato con successo:', reportId);
    toast({
      title: "Successo",
      description: "Il report è stato eliminato con successo",
    });
    
    return reportId;
  } catch (error: any) {
    console.error('[deleteReportFile] Errore nel processo di eliminazione:', error);
    console.error('[deleteReportFile] Stack trace:', error.stack);
    
    // Check if it's a network error
    if (error.message && error.message.includes('network')) {
      console.error('[deleteReportFile] Possibile errore di rete o connessione');
    }
    
    // Log any response status if available
    if (error.status) {
      console.error('[deleteReportFile] Status code dell\'errore:', error.status);
    }
    
    toast({
      title: "Errore eliminazione",
      description: `Si è verificato un errore: ${error.message || 'Errore sconosciuto'}`,
      variant: "destructive",
    });
    throw error;
  }
};
