
import { MainLayout } from '@/components/layouts/MainLayout';
import { ReportDashboard } from '@/components/reports/ReportDashboard';
import { FileBarChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileBarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Report</h1>
              <p className="text-muted-foreground">
                Genera e gestisci i report PDF per i tuoi servizi
              </p>
            </div>
          </div>
        </div>

        <ReportDashboard />
      </div>
    </MainLayout>
  );
}
