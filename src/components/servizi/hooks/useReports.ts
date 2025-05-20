
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { downloadReportFile, fetchReports, deleteReportFile } from './reports/api';
import { toast } from '@/components/ui/use-toast';

export const useReports = () => {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isDeletingReport, setIsDeletingReport] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: fetchReports,
  });

  // Download report mutation
  const downloadReport = async (reportId: string) => {
    if (isDownloading === reportId) return;
    
    setIsDownloading(reportId);
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Report non trovato');
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
      console.error('Error downloading report:', error);
      toast({
        title: "Errore",
        description: `Impossibile scaricare il report: ${error.message || 'Errore sconosciuto'}`,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(null);
    }
  };

  // Delete report mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report non trovato');
      
      // Get the actual bucket name from the report record if available
      const bucketName = report.bucket_name || 'report_aziende';
      
      await deleteReportFile({
        reportId,
        filePath: report.file_path,
        bucketName
      });
      return reportId;
    },
    onMutate: (reportId) => {
      console.log('Started deleting report:', reportId);
      setIsDeletingReport(reportId);
    },
    onSuccess: (reportId) => {
      console.log('Successfully deleted report:', reportId);
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Report eliminato",
        description: "Il report è stato eliminato con successo.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting report:', error);
      toast({
        title: "Errore",
        description: `Impossibile eliminare il report: ${error.message || 'Errore sconosciuto'}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      console.log('Delete report operation settled');
      setIsDeletingReport(null);
    }
  });

  const deleteReport = (reportId: string) => {
    console.log('Deleting report with ID:', reportId);
    return deleteReportMutation.mutate(reportId);
  };

  return {
    reports,
    isLoading,
    error,
    downloadReport,
    deleteReport,
    isDeletingReport: !!isDeletingReport
  };
};
