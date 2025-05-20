
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface DownloadReportParams {
  filePath: string;
  fileName: string;
  bucketName?: string; // Optional bucket name parameter
}

export const downloadReportFile = async ({
  filePath,
  fileName,
  bucketName = 'report_aziende' // Default bucket name
}: DownloadReportParams) => {
  console.log(`Downloading file ${fileName} from path ${filePath} in bucket ${bucketName}`);
  
  try {
    // Verifichiamo prima che il bucket esista
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Errore nel recupero dei bucket:', bucketsError);
      throw new Error(`Errore nel recupero dei bucket: ${bucketsError.message}`);
    }
    
    // Cerca il bucket con qualsiasi case
    const bucketExists = buckets.some(bucket => 
      bucket.name.toLowerCase() === bucketName.toLowerCase()
    );
    
    if (!bucketExists) {
      console.error(`Il bucket "${bucketName}" non esiste`);
      toast({
        title: 'Bucket non trovato',
        description: `Il bucket "${bucketName}" non esiste. Contatta l'amministratore.`,
        variant: 'destructive',
      });
      
      return false;
    }
    
    // Trova il nome effettivo del bucket con case corretto
    const actualBucketName = buckets.find(bucket => 
      bucket.name.toLowerCase() === bucketName.toLowerCase()
    )?.name || bucketName;
    
    // Get the file
    const { data, error } = await supabase
      .storage
      .from(actualBucketName)
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Errore nel download del file: ${error.message}`);
    }

    if (!data) {
      throw new Error('File non trovato');
    }

    // Create a download link
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    toast({
      title: 'Download completato',
      description: `Il file ${fileName} è stato scaricato con successo.`
    });
    
    console.log('File downloaded successfully');
    return true;
  } catch (error: any) {
    console.error('Error in downloadReportFile:', error);
    toast({
      title: 'Errore nel download',
      description: error.message || 'Si è verificato un errore durante il download del file',
      variant: 'destructive',
    });
    throw error;
  }
};
