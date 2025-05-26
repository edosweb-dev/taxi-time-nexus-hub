
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Report, CreateReportData, ReportFilters } from '@/lib/types/reports';

export function useReports(filters: ReportFilters = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('reports')
        .select(`
          *,
          azienda:aziende(id, nome)
        `)
        .order('created_at', { ascending: false });

      if (filters.azienda_id) {
        query = query.eq('azienda_id', filters.azienda_id);
      }
      if (filters.tipo_report) {
        query = query.eq('tipo_report', filters.tipo_report);
      }
      if (filters.data_inizio) {
        query = query.gte('data_inizio', filters.data_inizio);
      }
      if (filters.data_fine) {
        query = query.lte('data_fine', filters.data_fine);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Report[];
    },
    enabled: !!user,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: CreateReportData) => {
      if (!user) throw new Error('User not authenticated');
      
      const reportData = {
        ...data,
        created_by: user.id,
        nome_file: `report_${data.tipo_report}_${data.data_inizio}_${data.data_fine}.pdf`,
        stato: 'in_generazione' as const,
      };

      const { data: report, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report in generazione');
    },
    onError: (error: any) => {
      toast.error(`Errore nella generazione del report: ${error.message}`);
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report eliminato');
    },
    onError: (error: any) => {
      toast.error(`Errore nell'eliminazione del report: ${error.message}`);
    },
  });

  const downloadReport = async (report: Report) => {
    if (!report.url_file) {
      toast.error('File del report non disponibile');
      return;
    }

    try {
      // Simuliamo il download - in un'implementazione reale si userebbe un URL o Storage
      const link = document.createElement('a');
      link.href = report.url_file;
      link.download = report.nome_file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download avviato');
    } catch (error) {
      toast.error('Errore nel download del report');
    }
  };

  return {
    reports,
    isLoading,
    error,
    generateReport: generateReportMutation.mutate,
    isGenerating: generateReportMutation.isPending,
    deleteReport: deleteReportMutation.mutate,
    isDeleting: deleteReportMutation.isPending,
    downloadReport,
  };
}
