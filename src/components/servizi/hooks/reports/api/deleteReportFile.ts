
import { supabase } from '@/lib/supabase';

interface DeleteReportParams {
  reportId: string;
  filePath: string;
  bucketName?: string;
}

export const deleteReportFile = async ({
  reportId,
  filePath,
  bucketName = 'report_aziende'
}: DeleteReportParams) => {
  console.log(`[deleteReportFile] 🚀 STARTING deletion for report ID:`, reportId);
  
  try {
    // Verifica utente corrente
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[deleteReportFile] 👤 Current user:', user?.id);
    
    if (authError || !user) {
      console.error('[deleteReportFile] ❌ Authentication error:', authError);
      throw new Error('Utente non autenticato');
    }

    // Prima verifica che il report esista
    console.log('[deleteReportFile] 🔍 Checking if report exists...');
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    console.log('[deleteReportFile] 📋 Existing report check:', { existingReport, checkError });
    
    if (checkError) {
      console.error('[deleteReportFile] ❌ Error checking report existence:', checkError);
      throw new Error(`Errore nel verificare l'esistenza del report: ${checkError.message}`);
    }
    
    if (!existingReport) {
      console.error('[deleteReportFile] ❌ Report not found in database');
      throw new Error('Report non trovato nel database');
    }

    const actualBucketName = existingReport.bucket_name || bucketName;
    console.log(`[deleteReportFile] 🗂️ Using bucket: ${actualBucketName}, file path: ${filePath}`);
    
    // Prova a eliminare il file dallo storage (non bloccante se non esiste)
    console.log('[deleteReportFile] 📁 Attempting to delete file from storage...');
    const { error: storageError } = await supabase
      .storage
      .from(actualBucketName)
      .remove([filePath]);

    if (storageError) {
      console.warn('[deleteReportFile] ⚠️ Storage deletion warning:', storageError.message);
      // Non bloccare se il file non esiste
      if (!storageError.message.includes('not found') && 
          !storageError.message.includes('Object not found')) {
        console.error('[deleteReportFile] ❌ Critical storage error:', storageError);
        // Continuiamo comunque con la cancellazione dal database
      }
    } else {
      console.log('[deleteReportFile] ✅ File deleted successfully from storage');
    }

    // Eliminazione dal database - FOCUS QUI
    console.log('[deleteReportFile] 🗄️ Attempting to delete from database...');
    console.log('[deleteReportFile] 🗄️ Report ID to delete:', reportId);
    
    const { data: deleteResult, error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .select('*');

    console.log('[deleteReportFile] 🗄️ Database deletion result:', { deleteResult, deleteError });

    if (deleteError) {
      console.error('[deleteReportFile] ❌ Database deletion failed:', deleteError);
      throw new Error(`Errore nell'eliminazione dal database: ${deleteError.message}`);
    }

    // Verifica che sia stato effettivamente eliminato
    if (!deleteResult || deleteResult.length === 0) {
      console.error('[deleteReportFile] ❌ No rows were deleted from database');
      throw new Error('Nessun record è stato eliminato dal database');
    }

    console.log('[deleteReportFile] ✅ Successfully deleted from database:', deleteResult);

    // Verifica finale
    console.log('[deleteReportFile] 🔍 Final verification...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('reports')
      .select('id')
      .eq('id', reportId);
    
    console.log('[deleteReportFile] 🔍 Final check result:', { finalCheck, finalError });
    
    if (finalCheck && finalCheck.length > 0) {
      console.error('[deleteReportFile] ❌ Report still exists after deletion!');
      throw new Error('Il report è ancora presente nel database dopo l\'eliminazione');
    }
    
    console.log('[deleteReportFile] 🎉 DELETION COMPLETED SUCCESSFULLY');
    return true;
    
  } catch (error: any) {
    console.error('[deleteReportFile] 💥 DELETION FAILED:', error);
    throw error;
  }
};
