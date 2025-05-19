
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types/index';
import { toast } from '@/components/ui/use-toast';

// Fetch all reports
export const fetchReports = async (): Promise<Report[]> => {
  console.log('Fetching reports...');
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
  
  console.log(`Retrieved ${data?.length || 0} reports`);
  if (data && data.length > 0) {
    console.log('Sample report data:', {
      id: data[0].id,
      azienda_id: data[0].azienda_id,
      referente_id: data[0].referente_id,
      servizi_ids: data[0].servizi_ids?.length || 0
    });
  } else {
    console.log('No reports found in database');
  }
  
  return data as Report[];
};

// Download a report by ID
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

// Delete a report by ID
export const deleteReportFile = async (reportId: string, reports: Report[]): Promise<string> => {
  console.log('[deleteReportFile] INIZIO con reportId:', reportId);
  
  // Find the report
  const report = reports.find(r => r.id === reportId);
  if (!report) {
    console.error('[deleteReportFile] Report not found for ID:', reportId);
    throw new Error('Report non trovato');
  }

  console.log('[deleteReportFile] Report trovato:', report);
  console.log('[deleteReportFile] Eliminazione file da storage:', report.file_path);
  
  try {
    // Show deletion in progress toast
    toast({
      title: "Eliminazione in corso",
      description: "Eliminazione del report in corso..."
    });
    
    // First, delete the file from storage
    console.log('[deleteReportFile] Tentativo eliminazione file da bucket:', report.file_path);
    const { data: storageData, error: storageError } = await supabase.storage
      .from('report_aziende')
      .remove([report.file_path]);
      
    console.log('[deleteReportFile] Storage remove result:', storageData);
      
    if (storageError) {
      console.error('[deleteReportFile] Errore eliminazione file da storage:', storageError);
      toast({
        title: "Errore storage",
        description: `Impossibile eliminare il file report: ${storageError.message}`,
        variant: "destructive",
      });
      throw storageError;
    }
    
    // Then, delete the report record from the database
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
    toast({
      title: "Successo",
      description: "Il report è stato eliminato con successo",
    });
    
    return reportId;
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
