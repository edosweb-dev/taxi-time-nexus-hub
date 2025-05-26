
import { MainLayout } from '@/components/layouts/MainLayout';
import { ReportList } from '@/components/reports/ReportList';
import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { FileBarChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FileBarChart className="h-6 w-6" />
          <h1 className="text-3xl font-bold tracking-tight">Report</h1>
        </div>
        <p className="text-muted-foreground">
          Genera e gestisci i report PDF per servizi, dati finanziari e veicoli.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ReportGenerator />
          </div>
          
          <div className="lg:col-span-2">
            <ReportList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
