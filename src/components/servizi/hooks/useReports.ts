
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export interface Report {
  id: string;
  azienda_id: string;
  referente_id: string;
  month: number;
  year: number;
  created_at: string;
  created_by: string;
  file_path: string;
  file_name: string;
  servizi_ids: string[];
}

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
  
  return {
    reports,
    isLoading,
    error,
    downloadReport,
  };
};
