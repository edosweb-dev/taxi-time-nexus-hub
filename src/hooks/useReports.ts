import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Report, CreateReportData, ReportFilters, AvailableMonth } from '@/lib/types/reports';

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
          azienda:aziende(id, nome),
          referente:profiles!reports_referente_id_fkey(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.azienda_id && filters.azienda_id !== 'all') {
        query = query.eq('azienda_id', filters.azienda_id);
      }
      if (filters.tipo_report && filters.tipo_report !== 'all') {
        query = query.eq('tipo_report', filters.tipo_report);
      }
      if (filters.referente_id && filters.referente_id !== 'all') {
        query = query.eq('referente_id', filters.referente_id);
      }
      if (filters.data_inizio) {
        query = query.gte('data_inizio', filters.data_inizio);
      }
      if (filters.data_fine) {
        query = query.lte('data_fine', filters.data_fine);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: CreateReportData) => {
      if (!user) throw new Error('User not authenticated');
      
      const reportData = {
        ...data,
        created_by: user.id,
        nome_file: `${data.is_preview ? 'anteprima_' : ''}report_${data.tipo_report}_${data.data_inizio}_${data.data_fine}.pdf`,
        stato: 'in_generazione' as const,
      };

      const { data: report, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();

      if (error) throw error;
      return { report, is_preview: data.is_preview };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      if (result.is_preview) {
        toast.success('Anteprima report in generazione');
      } else {
        toast.success('Report in generazione');
      }
    },
    onError: (error: any) => {
      toast.error(`Errore nella generazione del report: ${error.message}`);
    },
  });

  const generatePreviewMutation = useMutation({
    mutationFn: async (data: CreateReportData) => {
      if (!user) throw new Error('User not authenticated');
      
      // Per l'anteprima, generiamo dati mock senza salvare nel database
      const mockReport: Report = {
        id: 'preview-' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        azienda_id: data.azienda_id,
        created_by: user.id,
        tipo_report: data.tipo_report,
        nome_file: `anteprima_report_${data.tipo_report}_${data.data_inizio}_${data.data_fine}.pdf`,
        url_file: undefined,
        data_inizio: data.data_inizio,
        data_fine: data.data_fine,
        numero_servizi: Math.floor(Math.random() * 50) + 1,
        totale_imponibile: Math.floor(Math.random() * 10000) + 1000,
        totale_iva: 0,
        totale_documento: 0,
        stato: 'completato' as const,
        referente_id: data.referente_id,
      };
      
      // Calcola IVA e totale
      mockReport.totale_iva = mockReport.totale_imponibile * 0.22;
      mockReport.totale_documento = mockReport.totale_imponibile + mockReport.totale_iva;
      
      return mockReport;
    },
    onSuccess: () => {
      toast.success('Anteprima generata');
    },
    onError: (error: any) => {
      toast.error(`Errore nella generazione dell'anteprima: ${error.message}`);
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
    generatePreview: generatePreviewMutation.mutate,
    isGeneratingPreview: generatePreviewMutation.isPending,
    deleteReport: deleteReportMutation.mutate,
    isDeleting: deleteReportMutation.isPending,
    downloadReport,
  };
}

export function useAvailableMonths(aziendaId: string, referenteId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['available-months', aziendaId, referenteId],
    queryFn: async (): Promise<AvailableMonth[]> => {
      let query = supabase
        .from('servizi')
        .select('data_servizio')
        .eq('azienda_id', aziendaId)
        .eq('stato', 'consuntivato');

      if (referenteId) {
        query = query.eq('referente_id', referenteId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Raggruppa per mese e anno
      const monthsMap = new Map<string, { year: number; month: number; count: number }>();
      
      data?.forEach((servizio) => {
        const date = new Date(servizio.data_servizio);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // JavaScript months are 0-based
        const key = `${year}-${month}`;
        
        if (monthsMap.has(key)) {
          monthsMap.get(key)!.count += 1;
        } else {
          monthsMap.set(key, { year, month, count: 1 });
        }
      });

      // Converti in array e ordina
      const months: AvailableMonth[] = Array.from(monthsMap.values())
        .map(({ year, month, count }) => ({
          year,
          month,
          monthName: new Date(year, month - 1).toLocaleDateString('it-IT', { 
            month: 'long', 
            year: 'numeric' 
          }),
          servicesCount: count
        }))
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });

      return months;
    },
    enabled: !!user && !!aziendaId,
  });
}
