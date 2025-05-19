
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Report } from '@/lib/types/index';
import { fetchReports, downloadReportFile, deleteReportFile } from './reportApi';
import { toast } from '@/components/ui/use-toast';

export const useReportsData = () => {
  const queryClient = useQueryClient();
  
  // Query for fetching reports
  const { 
    data: reports = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });
  
  // Function to download report
  const downloadReport = (reportId: string) => {
    downloadReportFile(reportId, reports);
  };
  
  // Mutation for deleting a report
  const deleteReportMutation = useMutation({
    mutationFn: (reportId: string) => {
      console.log('[deleteReport] Chiamata mutation con ID:', reportId);
      console.log('[deleteReport] Passando reports con lunghezza:', reports.length);
      return deleteReportFile(reportId, reports);
    },
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      console.log('[deleteReport] Starting delete mutation for report ID:', deletedId);
      await queryClient.cancelQueries({ queryKey: ['reports'] });
      
      // Snapshot the previous value
      const previousReports = queryClient.getQueryData(['reports']);
      console.log('[deleteReport] Cached reports before optimistic update:', 
                 Array.isArray(previousReports) ? previousReports.length : 'no data');
      
      // Optimistically update to the new value
      queryClient.setQueryData(['reports'], (old: Report[] | undefined) => {
        console.log('[deleteReport] Optimistically removing report from cache:', deletedId);
        console.log('[deleteReport] Old cache size:', old ? old.length : 0);
        const newData = old ? old.filter(report => report.id !== deletedId) : [];
        console.log('[deleteReport] New cache size after optimistic update:', newData.length);
        return newData;
      });
      
      // Return a context object with the snapshotted value
      return { previousReports };
    },
    onSuccess: (deletedId) => {
      console.log('[deleteReport] Mutation completed successfully for report:', deletedId);
      
      toast({
        title: 'Successo',
        description: 'Report eliminato con successo',
      });
      
      // Invalidate to ensure we're in sync with the server
      console.log('[deleteReport] Invalidating reports query after successful deletion');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any, deletedId, context) => {
      console.error('[deleteReport] Errore nella mutation:', error);
      console.error('[deleteReport] Error message:', error.message);
      console.error('[deleteReport] Error stack:', error.stack);
      
      // Rollback to the previous state
      if (context?.previousReports) {
        console.log('[deleteReport] Rolling back to previous state due to error');
        queryClient.setQueryData(['reports'], context.previousReports);
      }
      
      toast({
        title: 'Errore',
        description: `Impossibile eliminare il report: ${error.message || 'Si è verificato un errore'}`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      console.log('[deleteReport] Mutation conclusa, invalidating reports query');
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
  
  // Wrapper function for delete mutation
  const deleteReport = (reportId: string) => {
    console.log('[deleteReport] DeleteReport function called with ID:', reportId);
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
