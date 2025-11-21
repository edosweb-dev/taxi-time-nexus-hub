import { useState } from 'react';
import { useReportSoci } from '@/hooks/useReportSoci';
import { ReportSociFilters } from './ReportSociFilters';
import { ReportSociStatsCard } from './ReportSociStats';
import { TabellaDatiSoci } from './TabellaDatiSoci';

export function ReportSociDashboard() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data, isLoading } = useReportSoci(selectedMonth, selectedYear);

  const handleReset = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  return (
    <div className="space-y-6">
      <ReportSociFilters
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onReset={handleReset}
      />

      <ReportSociStatsCard stats={data?.stats} />

      <TabellaDatiSoci data={data?.rows} isLoading={isLoading} />
    </div>
  );
}
