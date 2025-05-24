
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
  console.log(`Deleting report ${reportId} with file path ${filePath} from bucket ${bucketName}`);
  
  try {
    // First delete the file from storage - MIGLIORATA GESTIONE ERRORI
    const { error: storageError } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);

    // Non bloccare l'eliminazione se il file non esiste più
    if (storageError && !storageError.message.includes('not found') && !storageError.message.includes('Object not found')) {
      console.error('Error deleting file from storage:', storageError);
      throw new Error(`Errore nell'eliminazione del file: ${storageError.message}`);
    }

    if (storageError) {
      console.warn('File not found in storage, continuing with database deletion:', storageError.message);
    } else {
      console.log('File deleted successfully from storage');
    }

    // Then delete the report record from the database
    const { error: dbError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (dbError) {
      console.error('Error deleting report record:', dbError);
      throw new Error(`Errore nell'eliminazione del report dal database: ${dbError.message}`);
    }
    
    console.log('Report deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error in deleteReportFile:', error);
    throw error;
  }
};
