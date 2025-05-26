
import { supabase } from '@/lib/supabase';

interface DeleteReportParams {
  reportId: string;
  filePath: string;
  bucketName?: string;
}

interface DeleteReportResult {
  success: boolean;
  storageDeleted: boolean;
  databaseDeleted: boolean;
  deletedReport?: any;
  error?: string;
}

export const deleteReportFile = async ({
  reportId,
  filePath,
  bucketName = 'report_aziende'
}: DeleteReportParams): Promise<DeleteReportResult> => {
  console.log(`🚀 [deleteReportFile] STARTING deletion for report ID:`, reportId);
  
  try {
    // 🔐 Verifica utente corrente con logging dettagliato
    console.log('🔐 [deleteReportFile] Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 [deleteReportFile] Current user:', user?.id);
    
    if (authError || !user) {
      console.error('❌ [deleteReportFile] Authentication failed:', authError);
      throw new Error('Utente non autenticato');
    }

    // 🔍 Verifica esistenza e permessi del report
    console.log('🔍 [deleteReportFile] Checking report existence and permissions...');
    const { data: existingReport, error: checkError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    console.log('📋 [deleteReportFile] Report check result:', { existingReport, checkError });
    
    if (checkError) {
      console.error('❌ [deleteReportFile] Error checking report:', checkError);
      throw new Error(`Errore nel verificare l'esistenza del report: ${checkError.message}`);
    }
    
    if (!existingReport) {
      console.error('❌ [deleteReportFile] Report not found in database');
      throw new Error('Report non trovato nel database');
    }

    // 🗂️ Determina bucket corretto
    const actualBucketName = existingReport.bucket_name || bucketName;
    console.log(`🗂️ [deleteReportFile] Using bucket: ${actualBucketName}, file path: ${filePath}`);
    
    let storageDeleted = false;
    
    // 📁 Tentativo eliminazione storage (non bloccante)
    console.log('📁 [deleteReportFile] Attempting storage deletion...');
    try {
      const { error: storageError } = await supabase
        .storage
        .from(actualBucketName)
        .remove([filePath]);

      if (storageError) {
        console.warn('⚠️ [deleteReportFile] Storage deletion warning:', storageError.message);
        if (storageError.message.includes('not found') || 
            storageError.message.includes('Object not found')) {
          console.log('📁 [deleteReportFile] File not found in storage (acceptable)');
          storageDeleted = true; // Consideriamo eliminato se non esisteva
        } else {
          console.warn('⚠️ [deleteReportFile] Storage error, continuing with database deletion');
        }
      } else {
        console.log('✅ [deleteReportFile] File deleted successfully from storage');
        storageDeleted = true;
      }
    } catch (storageException) {
      console.warn('⚠️ [deleteReportFile] Storage exception, continuing:', storageException);
    }

    // 🗄️ Eliminazione dal database con logging dettagliato
    console.log('🗄️ [deleteReportFile] Attempting database deletion...');
    console.log(`🎯 [deleteReportFile] Target report ID: ${reportId}`);
    
    const { data: deletedData, error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .select('*'); // Importante: select per vedere cosa è stato eliminato

    console.log('📊 [deleteReportFile] Database deletion result:', { 
      deletedData, 
      deleteError,
      deletedCount: deletedData?.length || 0 
    });

    if (deleteError) {
      console.error('❌ [deleteReportFile] Database deletion failed:', deleteError);
      throw new Error(`Errore nell'eliminazione dal database: ${deleteError.message}`);
    }

    if (!deletedData || deletedData.length === 0) {
      console.error('❌ [deleteReportFile] No rows deleted from database');
      throw new Error('Nessun record è stato eliminato dal database');
    }

    console.log('✅ [deleteReportFile] Database deletion successful:', deletedData[0]);

    // 🔍 Verifica finale con doppio controllo
    console.log('🔍 [deleteReportFile] Final verification...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('reports')
      .select('id')
      .eq('id', reportId);
    
    console.log('🔍 [deleteReportFile] Final check result:', { 
      finalCheck, 
      finalError, 
      stillExists: finalCheck && finalCheck.length > 0 
    });
    
    if (finalCheck && finalCheck.length > 0) {
      console.error('❌ [deleteReportFile] Report still exists after deletion!');
      throw new Error('Il report è ancora presente nel database dopo l\'eliminazione');
    }
    
    console.log('🎉 [deleteReportFile] DELETION COMPLETED SUCCESSFULLY');
    
    return {
      success: true,
      storageDeleted,
      databaseDeleted: true,
      deletedReport: deletedData[0]
    };
    
  } catch (error: any) {
    console.error('💥 [deleteReportFile] DELETION FAILED:', error);
    return {
      success: false,
      storageDeleted: false,
      databaseDeleted: false,
      error: error.message
    };
  }
};
