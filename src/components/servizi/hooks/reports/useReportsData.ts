
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Report } from '@/lib/types/index';
import { fetchReports, downloadReportFile, deleteReportFile } from './api';
import { toast } from '@/components/ui/use-toast';

export const useReportsData = () => {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Query per il recupero dei report
  const { 
    data: reports = [], 
    isLoading, 
    error,
    refetch: refetchReports 
  } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });
  
  // Funzione per il download del report
  const downloadReport = async (reportId: string) => {
    console.log('[downloadReport] Download requested for report:', reportId);
    
    if (isDownloading === reportId) return;
    
    setIsDownloading(reportId);
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        console.error('[downloadReport] Report not found:', reportId);
        toast({
          title: 'Errore',
          description: 'Report non trovato',
          variant: 'destructive',
        });
        return;
      }
      
      // Get the actual bucket name from the report record if available
      const bucketName = report.bucket_name || 'report_aziende';
      
      await downloadReportFile({
        filePath: report.file_path, 
        fileName: report.file_name,
        bucketName
      });
      
      toast({
        title: "Download completato",
        description: "Il report è stato scaricato con successo.",
      });
    } catch (error: any) {
      console.error('[downloadReport] Error downloading report:', error);
      toast({
        title: "Errore nel download",
        description: error.message || 'Si è verificato un errore durante il download del file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(null);
    }
  };
  
  // Mutation per l'eliminazione di un report
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      console.log('[deleteReport] Chiamata mutation con ID:', reportId);
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report non trovato');
      }
      
      // Get the actual bucket name from the report record if available
      const bucketName = report.bucket_name || 'report_aziende';
      
      await deleteReportFile({
        reportId,
        filePath: report.file_path,
        bucketName
      });
      return reportId;
    },
    onMutate: async (deletedId) => {
      // Cancella eventuali refetch in uscita
      console.log('[deleteReport] Starting delete mutation for report ID:', deletedId);
      await queryClient.cancelQueries({ queryKey: ['reports'] });
      
      // Snapshot dello stato precedente
      const previousReports = queryClient.getQueryData(['reports']) as Report[];
      console.log('[deleteReport] Cached reports before optimistic update:', 
                 Array.isArray(previousReports) ? previousReports.length : 'no data');
      
      // Aggiornamento ottimistico dell'UI
      queryClient.setQueryData(['reports'], (old: Report[] | undefined) => {
        console.log('[deleteReport] Optimistically removing report from cache:', deletedId);
        console.log('[deleteReport] Old cache size:', old ? old.length : 0);
        const newData = old ? old.filter(report => report.id !== deletedId) : [];
        console.log('[deleteReport] New cache size after optimistic update:', newData.length);
        return newData;
      });
      
      // Ritorna un oggetto context con lo stato precedente
      return { previousReports };
    },
    onSuccess: (deletedId) => {
      console.log('[deleteReport] Mutation completed successfully for report:', deletedId);
      
      // Notifica di successo con toast
      toast({
        title: 'Report eliminato',
        description: 'Il report è stato eliminato con successo.',
      });
      
      console.log('[deleteReport] Invalidating reports query after successful deletion');
      // Invalidare per assicurarsi di essere sincronizzati con il server
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error: any, deletedId, context) => {
      console.error('[deleteReport] Errore nella mutation:', error);
      console.error('[deleteReport] Error message:', error.message);
      console.error('[deleteReport] Error stack:', error.stack);
      
      // Rollback allo stato precedente
      if (context?.previousReports) {
        console.log('[deleteReport] Rolling back to previous state due to error');
        queryClient.setQueryData(['reports'], context.previousReports);
      }
      
      // Notifica di errore con toast
      toast({
        title: 'Errore',
        description: `Impossibile eliminare il report: ${error.message || 'Si è verificato un errore'}`,
        variant: 'destructive',
      });
      
      // Forza un refetch per assicurarsi che l'UI sia sincronizzata con il server
      refetchReports();
    },
    onSettled: () => {
      console.log('[deleteReport] Delete report operation settled');
      // No need to set additional state as this is handled in the component
    }
  });
  
  // Funzione wrapper per la mutation di eliminazione
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
    isDeletingReport: deleteReportMutation.isPending,
    isDownloading: !!isDownloading,
    refetchReports
  };
};
