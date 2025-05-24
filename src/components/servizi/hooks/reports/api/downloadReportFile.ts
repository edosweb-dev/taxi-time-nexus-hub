
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
    // Get the file directly - no need for complex bucket verification
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      
      // Provide specific error messages based on error type
      if (error.message.includes('not found')) {
        toast({
          title: 'File non trovato',
          description: `Il file ${fileName} non è stato trovato nel sistema di storage.`,
          variant: 'destructive',
        });
      } else if (error.message.includes('permission')) {
        toast({
          title: 'Errore di permessi',
          description: 'Non hai i permessi necessari per scaricare questo file.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Errore nel download',
          description: `Errore nel download del file: ${error.message}`,
          variant: 'destructive',
        });
      }
      throw new Error(`Errore nel download del file: ${error.message}`);
    }

    if (!data) {
      toast({
        title: 'File vuoto',
        description: 'Il file richiesto è vuoto o corrotto.',
        variant: 'destructive',
      });
      throw new Error('File non trovato o vuoto');
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
    
    // Only show toast if not already shown above
    if (!error.message?.includes('Errore nel download del file:')) {
      toast({
        title: 'Errore imprevisto',
        description: error.message || 'Si è verificato un errore imprevisto durante il download del file',
        variant: 'destructive',
      });
    }
    throw error;
  }
};
