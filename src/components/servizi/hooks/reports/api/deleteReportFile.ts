
import { supabase } from '@/lib/supabase';

interface DeleteReportParams {
  reportId: string;
  filePath: string;
  bucketName?: string; // Optional bucket name parameter
}

export const deleteReportFile = async ({
  reportId,
  filePath,
  bucketName = 'report_aziende' // Default bucket name
}: DeleteReportParams) => {
  console.log(`[deleteReportFile] 🚀 STARTING deletion:`, { reportId, filePath, bucketName });
  
  try {
    // Verifica utente corrente
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('[deleteReportFile] 👤 Current user:', user?.id, authError);
    
    if (authError || !user) {
      throw new Error('Utente non autenticato');
    }

    // Verifica esistenza report PRIMA dell'eliminazione
    const { data: reportCheckBefore, error: checkErrorBefore } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId);
    
    console.log('[deleteReportFile] 📋 Report before deletion:', { reportCheckBefore, checkErrorBefore });
    
    if (checkErrorBefore || !reportCheckBefore || reportCheckBefore.length === 0) {
      throw new Error(`Report non trovato: ${checkErrorBefore?.message || 'ID non valido'}`);
    }

    const report = reportCheckBefore[0];
    const actualBucketName = report.bucket_name || bucketName;
    
    console.log(`[deleteReportFile] 🗂️ Attempting to delete file from storage: ${actualBucketName}/${filePath}`);
    
    // Delete the file from storage
    const { error: storageError } = await supabase
      .storage
      .from(actualBucketName)
      .remove([filePath]);

    if (storageError) {
      console.warn('[deleteReportFile] ⚠️ Storage deletion warning:', storageError.message);
      
      // Non bloccare l'eliminazione se il file non esiste più
      if (!storageError.message.includes('not found') && !storageError.message.includes('Object not found')) {
        console.error('[deleteReportFile] ❌ Storage error:', storageError);
        throw new Error(`Errore nell'eliminazione del file: ${storageError.message}`);
      }
      
      console.log('[deleteReportFile] 📁 File not found in storage, continuing with database deletion');
    } else {
      console.log('[deleteReportFile] ✅ File deleted successfully from storage');
    }

    console.log('[deleteReportFile] 🗄️ Attempting to delete report record from database');
    
    // Then delete the report record from the database
    const { data: deleteResult, error: dbError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .select(); // Aggiungiamo select per vedere cosa viene eliminato

    console.log('[deleteReportFile] 🗄️ Database deletion result:', { deleteResult, dbError });

    if (dbError) {
      console.error('[deleteReportFile] ❌ Database deletion error:', dbError);
      throw new Error(`Errore nell'eliminazione del report dal database: ${dbError.message}`);
    }
    
    // Verifica che il report sia stato effettivamente eliminato
    const { data: reportCheckAfter, error: checkErrorAfter } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId);
    
    console.log('[deleteReportFile] 📋 Report after deletion:', { reportCheckAfter, checkErrorAfter });
    
    if (reportCheckAfter && reportCheckAfter.length > 0) {
      console.error('[deleteReportFile] ❌ Report still exists after deletion!');
      throw new Error('Il report non è stato eliminato dal database');
    }
    
    console.log('[deleteReportFile] ✅ Report deleted successfully from database');
    console.log('[deleteReportFile] 🎉 DELETION COMPLETED SUCCESSFULLY');
    
    return true;
  } catch (error: any) {
    console.error('[deleteReportFile] 💥 DELETION FAILED:', error);
    throw error;
  }
};
