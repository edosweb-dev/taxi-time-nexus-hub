
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Report } from '@/lib/types';

export const useReports = () => {
  const queryClient = useQueryClient();
  
  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      console.log('Fetching reports...');
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching reports:', error);
        return [];
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
    },
  });
  
  const downloadReport = async (reportId: string) => {
    try {
      // Find the report
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report non trovato');
      }
      
      // Get file from storage
      const { data, error } = await supabase.storage
        .from('report_aziende')
        .download(report.file_path);
        
      if (error) {
        console.error('Error downloading report:', error);
        throw error;
      }
      
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
      
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: 'Errore',
        description: `Impossibile scaricare il report: ${error.message || 'Si è verificato un errore'}`,
        variant: 'destructive',
      });
    }
  };
  
  // New delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      // Find the report
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report non trovato');
      }

      console.log('Deleting report:', reportId, 'File path:', report.file_path);
      
      // First, delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('report_aziende')
        .remove([report.file_path]);
        
      if (storageError) {
        console.error('Error deleting report file:', storageError);
        throw storageError;
      }
      
      console.log('Report file deleted successfully, now deleting database record');
      
      // Then, delete the report record
      const { error: dbError } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);
        
      if (dbError) {
        console.error('Error deleting report record:', dbError);
        throw dbError;
      }
      
      console.log('Report deleted successfully');
      return reportId;
    },
    onSuccess: () => {
      // Invalidate the reports query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Successo',
        description: 'Report eliminato con successo',
      });
    },
    onError: (error: any) => {
      console.error('Error in delete mutation:', error);
      toast({
        title: 'Errore',
        description: `Impossibile eliminare il report: ${error.message || 'Si è verificato un errore'}`,
        variant: 'destructive',
      });
    }
  });
  
  const deleteReport = (reportId: string) => {
    deleteReportMutation.mutate(reportId);
  };
  
  return {
    reports,
    isLoading,
    error,
    downloadReport,
    deleteReport,
    isDeletingReport: deleteReportMutation.isPending
  };
};
