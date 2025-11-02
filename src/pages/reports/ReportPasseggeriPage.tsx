import { MainLayout } from '@/components/layouts/MainLayout';
import { FileBarChart } from 'lucide-react';
import { ReportPasseggeriTable } from '@/components/reports/passeggeri/ReportPasseggeriTable';
import { ReportPasseggeriFilters } from '@/components/reports/passeggeri/ReportPasseggeriFilters';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { exportReportPasseggeri } from '@/lib/utils/exportReportPasseggeri';
import { useReportPasseggeri } from '@/hooks/useReportPasseggeri';
import { toast } from 'sonner';

export default function ReportPasseggeriPage() {
  const [filters, setFilters] = useState({
    dataInizio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    dataFine: new Date().toISOString().split('T')[0],
    aziendaId: '',
    referenteId: '',
    metodoPagamento: '',
    passeggeroId: '',
  });

  const { data: reportData, isLoading } = useReportPasseggeri(filters);

  const handleExport = () => {
    if (!reportData || reportData.length === 0) {
      toast.error('Nessun dato da esportare');
      return;
    }
    exportReportPasseggeri(reportData, filters.dataInizio, filters.dataFine);
    toast.success('Report esportato con successo');
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
          <Button onClick={handleExport} disabled={isLoading || !reportData?.length}>
            <Download className="h-4 w-4 mr-2" />
            Esporta CSV
          </Button>
        </div>

        <ReportPasseggeriFilters filters={filters} onFiltersChange={setFilters} />

        <ReportPasseggeriTable data={reportData || []} isLoading={isLoading} />
      </div>
    </MainLayout>
  );
}
