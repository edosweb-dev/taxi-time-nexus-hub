
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

    // Verifica esistenza report
    const { data: reportCheck, error: checkError } = await supabase
      .from('reports')
      .select('id, created_by, file_path, bucket_name')
      .eq('id', reportId)
      .single();
    
    console.log('[deleteReportFile] 📋 Report check:', { reportCheck, checkError });
    
    if (checkError || !reportCheck) {
      throw new Error(`Report non trovato: ${checkError?.message || 'ID non valido'}`);
    }

    // Use bucket name from report if available
    const actualBucketName = reportCheck.bucket_name || bucketName;
    
    console.log(`[deleteReportFile] 🗂️ Attempting to delete file from storage: ${actualBucketName}/${filePath}`);
    
    // Delete the file from storage - MIGLIORATA GESTIONE ERRORI
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
    const { error: dbError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (dbError) {
      console.error('[deleteReportFile] ❌ Database deletion error:', dbError);
      throw new Error(`Errore nell'eliminazione del report dal database: ${dbError.message}`);
    }
    
    console.log('[deleteReportFile] ✅ Report deleted successfully from database');
    console.log('[deleteReportFile] 🎉 DELETION COMPLETED SUCCESSFULLY');
    
    return true;
  } catch (error: any) {
    console.error('[deleteReportFile] 💥 DELETION FAILED:', error);
    throw error;
  }
};
