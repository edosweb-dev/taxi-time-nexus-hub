
import { supabase } from '@/lib/supabase';
import { Report } from '@/lib/types/index';
import { toast } from '@/components/ui/use-toast';

/**
 * Downloads a report file by ID with improved error handling
 */
export const downloadReportFile = async (reportId: string, reports: Report[]): Promise<void> => {
  console.log('[downloadReportFile] Starting download for report:', reportId);
  
  try {
    // First get the report data, preferably from DB but fallback to cache if available
    let report: Report | undefined;
    
    // Try to get fresh data from DB first
    try {
      console.log('[downloadReportFile] Fetching report from database');
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();
        
      if (reportError) {
        console.warn('[downloadReportFile] Error fetching report from DB, will try cache:', reportError);
        // We'll try the cache next
      } else if (reportData) {
        report = reportData as Report;
        console.log('[downloadReportFile] Report found in database:', report);
      }
    } catch (dbError) {
      console.warn('[downloadReportFile] Exception fetching report from DB:', dbError);
      // Will try the cache next
    }
    
    // If DB fetch failed, try from cache
    if (!report) {
      console.log('[downloadReportFile] Looking for report in cache');
      report = reports.find(r => r.id === reportId);
      
      if (!report) {
        console.error('[downloadReportFile] Report not found in cache either');
        toast({
          title: 'Errore',
          description: 'Report non trovato',
          variant: 'destructive',
        });
        return;
      }
      console.log('[downloadReportFile] Report found in cache:', report);
    }
    
    // Show download in progress toast
    toast({
      title: 'Download in corso',
      description: 'Download del report in corso...',
    });
    
    // Get file path from report
    const filePath = report.file_path;
    console.log('[downloadReportFile] File path:', filePath);
    
    // Download file from storage
    const { data, error } = await supabase.storage
      .from('report_aziende')
      .download(filePath);
      
    if (error) {
      console.error('[downloadReportFile] Error downloading file:', error);
      toast({
        title: 'Errore download',
        description: `Impossibile scaricare il file: ${error.message}`,
        variant: 'destructive',
      });
      return;
    }
    
    // Create URL for download
    const url = URL.createObjectURL(data);
    
    // Create anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = report.file_name || 'report.pdf';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    console.log('[downloadReportFile] Download initiated successfully');
    
    // Show success toast
    toast({
      title: 'Download completato',
      description: 'Il report è stato scaricato con successo',
    });
  } catch (error: any) {
    console.error('[downloadReportFile] Unexpected error:', error);
    toast({
      title: 'Errore',
      description: `Si è verificato un errore: ${error.message}`,
      variant: 'destructive',
    });
  }
};
