import { MainLayout } from '@/components/layouts/MainLayout';
import { FileBarChart, FileText } from 'lucide-react';
import { ReportPasseggeriTable } from '@/components/reports/passeggeri/ReportPasseggeriTable';
import { ReportPasseggeriFilters } from '@/components/reports/passeggeri/ReportPasseggeriFilters';
import { ReportPasseggeriChart } from '@/components/reports/passeggeri/ReportPasseggeriChart';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportReportPasseggeri } from '@/lib/utils/exportReportPasseggeri';
import { exportReportPasseggeriPdf } from '@/lib/utils/exportReportPasseggeriPdf';
import { useReportPasseggeri } from '@/hooks/useReportPasseggeri';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ReportPasseggeriPage() {
  const location = useLocation();
  const [filters, setFilters] = useState(() => {
    const savedFilters = location.state?.filters;
    if (savedFilters) {
      return savedFilters;
    }
    return {
      dataInizio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
      dataFine: new Date().toISOString().split('T')[0],
      aziendaId: '',
      referenteId: '',
      dipendenteId: '',
      socioId: '',
      stato: 'tutti',
    };
  });

  const { data: reportData, isLoading } = useReportPasseggeri(filters);

  // Fetch azienda name and firma_digitale_attiva if selected
  const { data: aziendaSelezionata } = useQuery({
    queryKey: ['azienda', filters.aziendaId],
    queryFn: async () => {
      if (!filters.aziendaId) return null;
      const { data } = await supabase
        .from('aziende')
        .select('nome, firma_digitale_attiva')
        .eq('id', filters.aziendaId)
        .single();
      return data;
    },
    enabled: !!filters.aziendaId,
  });

  // Fetch referente name if selected
  const { data: referenteSelezionato } = useQuery({
    queryKey: ['referente', filters.referenteId],
    queryFn: async () => {
      if (!filters.referenteId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', filters.referenteId)
        .single();
      return data ? `${data.first_name || ''} ${data.last_name || ''}`.trim() : null;
    },
    enabled: !!filters.referenteId,
  });

  const handleExport = () => {
    if (!reportData || reportData.length === 0) {
      toast.error('Nessun dato da esportare');
      return;
    }
    
    // Passa info azienda filtrata per logica N° Commessa / Firma
    const aziendaFiltrata = filters.aziendaId && aziendaSelezionata ? {
      id: filters.aziendaId,
      nome: aziendaSelezionata.nome,
      firma_digitale_attiva: aziendaSelezionata.firma_digitale_attiva || false
    } : null;
    
    exportReportPasseggeri(reportData, filters.dataInizio, filters.dataFine, aziendaFiltrata);
    toast.success('Report CSV esportato con successo');
  };

  const handleExportPdf = async () => {
    if (!reportData || reportData.length === 0) {
      toast.error('Nessun dato da esportare');
      return;
    }
    toast.info('Generazione PDF in corso...');
    try {
      await exportReportPasseggeriPdf(reportData, {
        dataInizio: filters.dataInizio,
        dataFine: filters.dataFine,
        aziendaNome: aziendaSelezionata?.nome,
        referenteNome: referenteSelezionato || undefined,
      });
      toast.success('Report PDF esportato con successo');
    } catch (err) {
      console.error('Errore export PDF:', err);
      toast.error('Errore nella generazione del PDF');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileBarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Report Passeggeri</h1>
              <p className="text-muted-foreground">
                Visualizza e analizza tutti i servizi con dettagli passeggeri
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportPdf} variant="outline" disabled={isLoading || !reportData?.length}>
              <FileText className="h-4 w-4 mr-2" />
              Esporta PDF
            </Button>
            <Button onClick={handleExport} disabled={isLoading || !reportData?.length}>
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
          </div>
        </div>

        <ReportPasseggeriFilters filters={filters} onFiltersChange={setFilters} />

        <ReportPasseggeriChart data={reportData || []} />

        <ReportPasseggeriTable 
          data={reportData || []} 
          isLoading={isLoading} 
          hasActiveFilters={!!(filters.aziendaId || filters.referenteId || filters.dipendenteId || filters.socioId || (filters.stato && filters.stato !== 'tutti'))}
          filters={filters}
        />
      </div>
    </MainLayout>
  );
}
