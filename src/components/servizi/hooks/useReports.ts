
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Report } from '@/lib/types/index';

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
        throw error; // This will trigger the error boundary in React Query
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
      
      // Mostra toast di download in corso
      toast({
        title: "Download in corso",
        description: "Preparazione del download del report..."
      });
      
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
  
  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      // Find the report
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report non trovato');
      }

      console.log('Deleting report:', reportId, 'File path:', report.file_path);
      
      try {
        // Mostra toast di eliminazione in corso
        toast({
          title: "Eliminazione in corso",
          description: "Eliminazione del report in corso..."
        });
        
        // First, delete the file from storage
        const { error: storageError } = await supabase.storage
          .from('report_aziende')
          .remove([report.file_path]);
          
        if (storageError) {
          console.error('Error deleting report file:', storageError);
          toast({
            title: "Errore",
            description: `Impossibile eliminare il file report: ${storageError.message}`,
            variant: "destructive",
          });
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
          toast({
            title: "Errore",
            description: `Impossibile eliminare il record del report: ${dbError.message}`,
            variant: "destructive",
          });
          throw dbError;
        }
        
        console.log('Report deleted successfully');
        return reportId;
      } catch (error) {
        console.error('Error in deletion process:', error);
        throw error;
      }
    },
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reports'] });
      
      // Snapshot the previous value
      const previousReports = queryClient.getQueryData(['reports']);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['reports'], (old: Report[] | undefined) => {
        return old ? old.filter(report => report.id !== deletedId) : [];
      });
      
      // Return a context object with the snapshotted value
      return { previousReports };
    },
    onSuccess: (deletedId) => {
      console.log('Mutation completed successfully for report:', deletedId);
      
      toast({
        title: 'Successo',
        description: 'Report eliminato con successo',
      });
      
      // No need to invalidate, we already updated the cache optimistically
    },
    onError: (error: any, deletedId, context) => {
      console.error('Error in delete mutation:', error);
      
      // Rollback to the previous state
      if (context?.previousReports) {
        queryClient.setQueryData(['reports'], context.previousReports);
      }
      
      toast({
        title: 'Errore',
        description: `Impossibile eliminare il report: ${error.message || 'Si è verificato un errore'}`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
  
  const deleteReport = (reportId: string) => {
    console.log('DeleteReport function called with ID:', reportId);
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
