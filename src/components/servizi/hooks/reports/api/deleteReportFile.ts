
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types/index';
import { toast } from '@/components/ui/use-toast';

/**
 * Elimina un file report per ID con gestione errori migliorata
 */
export const deleteReportFile = async (reportId: string): Promise<string> => {
  console.log('[deleteReportFile] INIZIO con reportId:', reportId);
  
  try {
    // Prima recupera il report direttamente dal database per avere i dati più aggiornati
    // invece di affidarsi alla cache
    console.log('[deleteReportFile] Recupero report aggiornato dal database');
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
      
    if (reportError) {
      console.error('[deleteReportFile] Errore nel recuperare il report dal database:', reportError);
      toast({
        title: "Errore database",
        description: `Errore nel recuperare il report: ${reportError.message}`,
        variant: "destructive",
      });
      throw new Error(`Errore nel recuperare il report: ${reportError.message}`);
    }
    
    if (!reportData) {
      console.error('[deleteReportFile] Report non trovato nel database con ID:', reportId);
      toast({
        title: "Errore",
        description: 'Report non trovato nel database',
        variant: "destructive",
      });
      throw new Error('Report non trovato nel database');
    }
    
    const report = reportData as Report;
    console.log('[deleteReportFile] Report recuperato dal DB:', report);
    
    // Show deletion in progress toast
    toast({
      title: "Eliminazione in corso",
      description: "Eliminazione del report in corso..."
    });
    
    let storageError = null;
    
    // First delete the file from storage
    try {
      console.log('[deleteReportFile] Tentativo eliminazione file da bucket:', report.file_path);
      const { data: storageData, error: tempStorageError } = await supabase.storage
        .from('report_aziende')
        .remove([report.file_path]);
        
      console.log('[deleteReportFile] Storage remove result:', storageData);
      
      if (tempStorageError) {
        storageError = tempStorageError;
        console.error('[deleteReportFile] Errore eliminazione file da storage:', tempStorageError);
        console.error('[deleteReportFile] Messaggio errore:', tempStorageError.message);
        
        // Check if it's a permission issue
        if (tempStorageError.message.includes('permission') || tempStorageError.message.includes('not allowed')) {
          console.error('[deleteReportFile] Problema di permessi sul bucket storage');
          toast({
            title: "Avviso",
            description: "Problema di permessi sul bucket storage. Eliminazione record database verrà comunque tentata.",
            variant: "destructive",
          });
        } else if (tempStorageError.message.includes('not found') || tempStorageError.message.includes('does not exist')) {
          // If the file doesn't exist, just log and continue with database deletion
          console.warn('[deleteReportFile] File non trovato nello storage, procedo comunque con eliminazione record');
          toast({
            title: "Avviso",
            description: "File non trovato nello storage. Eliminazione record database verrà comunque tentata.",
          });
        } else {
          toast({
            title: "Avviso storage",
            description: `Problema eliminazione file report: ${tempStorageError.message}. Eliminazione record database verrà comunque tentata.`,
            variant: "destructive",
          });
        }
      }
    } catch (unexpectedStorageError: any) {
      storageError = unexpectedStorageError;
      console.error('[deleteReportFile] Errore imprevisto eliminazione file:', unexpectedStorageError);
      toast({
        title: "Avviso",
        description: `Errore imprevisto eliminazione file: ${unexpectedStorageError.message}. Eliminazione record database verrà comunque tentata.`,
        variant: "destructive",
      });
    }
    
    // Then delete the report record from the database
    try {
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
      
      // Mostra toast di successo diverso a seconda della presenza di errori nello storage
      if (storageError) {
        toast({
          title: "Completato con avvisi",
          description: "Il record del report è stato eliminato, ma si sono verificati problemi con il file nello storage",
        });
      } else {
        toast({
          title: "Eliminato",
          description: "Il report è stato eliminato con successo",
        });
      }
      
      return reportId;
    } catch (dbError: any) {
      console.error('[deleteReportFile] Errore nel processo di eliminazione database:', dbError);
      
      toast({
        title: "Errore eliminazione",
        description: `Si è verificato un errore nell'eliminazione del database: ${dbError.message || 'Errore sconosciuto'}`,
        variant: "destructive",
      });
      throw dbError;
    }
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
