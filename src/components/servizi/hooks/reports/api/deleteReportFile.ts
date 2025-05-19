
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types/index';
import { toast } from '@/components/ui/use-toast';

/**
 * Deletes a report file by ID
 */
export const deleteReportFile = async (reportId: string, reports: Report[]): Promise<string> => {
  console.log('[deleteReportFile] INIZIO con reportId:', reportId);
  
  try {
    // First get the report directly from database to have most up-to-date data
    // instead of relying on the cache
    console.log('[deleteReportFile] Recupero report aggiornato dal database');
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
      
    if (reportError) {
      console.error('[deleteReportFile] Errore nel recuperare il report dal database:', reportError);
      throw new Error(`Errore nel recuperare il report: ${reportError.message}`);
    }
    
    if (!reportData) {
      console.error('[deleteReportFile] Report non trovato nel database con ID:', reportId);
      throw new Error('Report non trovato nel database');
    }
    
    const report = reportData as Report;
    console.log('[deleteReportFile] Report recuperato dal DB:', report);
    
    // Show deletion in progress toast
    toast({
      title: "Eliminazione in corso",
      description: "Eliminazione del report in corso..."
    });
    
    // First delete the file from storage
    console.log('[deleteReportFile] Tentativo eliminazione file da bucket:', report.file_path);
    const { data: storageData, error: storageError } = await supabase.storage
      .from('report_aziende')
      .remove([report.file_path]);
      
    console.log('[deleteReportFile] Storage remove result:', storageData);
      
    if (storageError) {
      console.error('[deleteReportFile] Errore eliminazione file da storage:', storageError);
      console.error('[deleteReportFile] Messaggio errore:', storageError.message);
      
      // Check if it's a permission issue
      if (storageError.message.includes('permission') || storageError.message.includes('not allowed')) {
        console.error('[deleteReportFile] Problema di permessi sul bucket storage');
        toast({
          title: "Errore di permessi",
          description: "Non hai i permessi necessari per eliminare questo file. Contatta l'amministratore.",
          variant: "destructive",
        });
      } else if (storageError.message.includes('not found') || storageError.message.includes('does not exist')) {
        // If the file doesn't exist, proceed with deleting the record anyway
        console.warn('[deleteReportFile] File non trovato nello storage, procedo comunque con eliminazione record');
      } else {
        toast({
          title: "Errore storage",
          description: `Impossibile eliminare il file report: ${storageError.message}`,
          variant: "destructive",
        });
        throw storageError;
      }
    }
    
    // Then delete the report record from the database
    console.log('[deleteReportFile] Tentativo eliminazione record da database:', reportId);
    const { data: dbData, error: dbError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .select();
      
    console.log('[deleteReportFile] DB delete result:', dbData);
      
    if (dbError) {
      console.error('[deleteReportFile] Errore eliminazione record dal database:', dbError);
      
      toast({
        title: "Errore database",
        description: `Impossibile eliminare il record del report: ${dbError.message}`,
        variant: "destructive",
      });
      throw dbError;
    }
    
    console.log('[deleteReportFile] Report eliminato con successo:', reportId);
    toast({
      title: "Successo",
      description: "Il report è stato eliminato con successo",
    });
    
    return reportId;
  } catch (error: any) {
    console.error('[deleteReportFile] Errore nel processo di eliminazione:', error);
    
    toast({
      title: "Errore eliminazione",
      description: `Si è verificato un errore: ${error.message || 'Errore sconosciuto'}`,
      variant: "destructive",
    });
    throw error;
  }
};
