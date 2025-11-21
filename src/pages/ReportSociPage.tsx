import { MainLayout } from '@/components/layouts/MainLayout';
import { ReportSociDashboard } from '@/components/report-soci/ReportSociDashboard';
import { FileBarChart } from 'lucide-react';

export default function ReportSociPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FileBarChart className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Report Soci</h1>
            <p className="text-muted-foreground">Dashboard finanziaria mensile per soci</p>
          </div>
        </div>

        <ReportSociDashboard />
      </div>
    </MainLayout>
  );
}
