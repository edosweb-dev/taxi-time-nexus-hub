
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types/index';
import { toast } from '@/components/ui/use-toast';

/**
 * Downloads a report file by ID
 */
export const downloadReportFile = async (reportId: string, reports: Report[]): Promise<void> => {
  try {
    // Find the report
    const report = reports.find(r => r.id === reportId);
    if (!report) {
      throw new Error('Report non trovato');
    }
    
    // Mostra toast di download in corso
    toast({
      title: "Download in corso",
      description: "Preparazione del download del report..."
    });
    
    console.log('Downloading report:', reportId, 'File path:', report.file_path);
    
    // Get file from storage
    const { data, error } = await supabase.storage
      .from('report_aziende')
      .download(report.file_path);
      
    if (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Errore",
        description: `Impossibile scaricare il report: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
    
    console.log('Report file downloaded successfully, creating download link');
    
    // Create download link
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = report.file_name;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    toast({
      title: "Download completato",
      description: "Il report è stato scaricato con successo."
    });
    
  } catch (error: any) {
    console.error('Error downloading report:', error);
    toast({
      title: 'Errore',
      description: `Impossibile scaricare il report: ${error.message || 'Si è verificato un errore'}`,
      variant: 'destructive',
    });
  }
};
