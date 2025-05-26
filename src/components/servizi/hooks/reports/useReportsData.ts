
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
      console.log('[deleteReportMutation] 🚀 Starting deletion for report:', reportId);
      
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report non trovato');
      }
      
      const bucketName = report.bucket_name || 'report_aziende';
      
      await deleteReportFile({
        reportId,
        filePath: report.file_path,
        bucketName
      });
      
      console.log('[deleteReportMutation] ✅ Deletion completed for report:', reportId);
      return reportId;
    },
    onSuccess: async (deletedId) => {
      console.log('[deleteReportMutation] ✅ Success callback for report:', deletedId);
      
      toast({
        title: 'Report eliminato',
        description: 'Il report è stato eliminato con successo.',
      });
      
      // Prima invalida la cache
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
      
      // Poi forza un refetch immediato
      await refetchReports();
      
      console.log('[deleteReportMutation] 🔄 Cache invalidated and refetch completed');
    },
    onError: (error: any, reportId) => {
      console.error('[deleteReportMutation] ❌ Error deleting report:', reportId, error);
      
      const errorMessage = error.message || 'Errore sconosciuto durante eliminazione';
      
      toast({
        title: 'Errore eliminazione',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });
  
  // Funzione wrapper per l'eliminazione
  const deleteReport = (reportId: string) => {
    console.log('[deleteReport] Calling mutation for report:', reportId);
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
    refetchReports,
  };
};
