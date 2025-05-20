
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
    // Get the file
    const { data, error } = await supabase
      .storage
      .from(bucketName)
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
