
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
  
  console.log('[useReportsData] 📊 Current reports count:', reports.length);
  
  // Funzione per il download del report
  const downloadReport = async (reportId: string) => {
    console.log('[downloadReport] 📥 Download requested for report:', reportId);
    
    if (isDownloading === reportId) return;
    
    setIsDownloading(reportId);
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        console.error('[downloadReport] ❌ Report not found:', reportId);
        toast({
          title: 'Errore',
          description: 'Report non trovato',
          variant: 'destructive',
        });
        return;
      }
      
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
      console.error('[downloadReport] ❌ Error downloading report:', error);
      toast({
        title: "Errore nel download",
        description: error.message || 'Si è verificato un errore durante il download del file',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(null);
    }
  };
  
  // Mutation per l'eliminazione di un report con cache update immediata
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      console.log('[deleteReportMutation] 🗑️ Starting deletion for report:', reportId);
      console.log('[deleteReportMutation] 📊 Reports before deletion:', reports.length);
      
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report non trovato nella cache locale');
      }
      
      const bucketName = report.bucket_name || 'report_aziende';
      
      const result = await deleteReportFile({
        reportId,
        filePath: report.file_path,
        bucketName
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Eliminazione fallita');
      }
      
      console.log('[deleteReportMutation] ✅ Deletion completed:', result);
      return { reportId, result };
    },
    onSuccess: async ({ reportId, result }) => {
      console.log('[deleteReportMutation] ✅ Success callback for report:', reportId);
      
      // 🔄 Aggiorna immediatamente la cache rimuovendo il report
      console.log('[deleteReportMutation] 🔄 Updating cache immediately...');
      queryClient.setQueryData(['reports'], (oldReports: Report[] | undefined) => {
        if (!oldReports) return [];
        const newReports = oldReports.filter(report => report.id !== reportId);
        console.log('[deleteReportMutation] 📊 Cache updated:', {
          before: oldReports.length,
          after: newReports.length,
          removed: reportId
        });
        return newReports;
      });
      
      // 🔄 Invalida e forza refetch della query
      console.log('[deleteReportMutation] 🔄 Invalidating query...');
      await queryClient.invalidateQueries({ 
        queryKey: ['reports'],
        refetchType: 'active'
      });
      
      // 🎉 Toast di successo con dettagli
      const toastMessage = result.storageDeleted && result.databaseDeleted
        ? 'Report eliminato completamente (file e database)'
        : result.databaseDeleted
        ? 'Report eliminato dal database'
        : 'Report eliminato parzialmente';
      
      toast({
        title: 'Report eliminato',
        description: toastMessage,
      });
      
      console.log('[deleteReportMutation] 🎉 Cache update and invalidation completed');
    },
    onError: (error: any, reportId) => {
      console.error('[deleteReportMutation] ❌ Error deleting report:', reportId, error);
      
      const errorMessage = error.message || 'Errore sconosciuto durante eliminazione';
      
      toast({
        title: 'Errore eliminazione',
        description: `Impossibile eliminare il report: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  });
  
  // Funzione wrapper per l'eliminazione
  const deleteReport = (reportId: string) => {
    console.log('[deleteReport] 🗑️ Calling mutation for report:', reportId);
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
