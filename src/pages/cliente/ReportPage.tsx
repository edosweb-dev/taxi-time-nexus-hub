
import React, { useEffect, useState } from 'react';
import { ClientDashboardLayout } from '@/components/layouts/ClientDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useReportsData } from '@/components/servizi/hooks/reports';
import { 
  ClientReportHeader, 
  ClientReportFilters, 
  ClientReportList, 
  ClientEmptyReport 
} from '@/components/servizi/report/components';

export default function ReportPage() {
  const { profile } = useAuth();
  const { reports, downloadReport, deleteReport, isDeletingReport } = useReportsData();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 + '');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + '');
  const [filteredReports, setFilteredReports] = useState<any[]>([]);

  useEffect(() => {
    if (reports && profile) {
      // Filter reports for this client and selected month/year
      setFilteredReports(
        reports.filter(
          (report) => 
            report.referente_id === profile.id && 
            report.month === parseInt(selectedMonth) && 
            report.year === parseInt(selectedYear)
        )
      );
    }
  }, [reports, selectedMonth, selectedYear, profile]);

  const monthOptions = [
    { value: '1', label: 'Gennaio' },
    { value: '2', label: 'Febbraio' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Aprile' },
    { value: '5', label: 'Maggio' },
    { value: '6', label: 'Giugno' },
    { value: '7', label: 'Luglio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Settembre' },
    { value: '10', label: 'Ottobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Dicembre' },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <ClientReportHeader 
          title="Report Mensili" 
          description="Visualizza e scarica i report dei servizi mensili" 
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Report
            </CardTitle>
            <CardDescription>
              Seleziona il mese e l'anno per visualizzare il report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientReportFilters 
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              monthOptions={monthOptions}
              yearOptions={yearOptions}
            />

            {filteredReports.length > 0 ? (
              <ClientReportList 
                filteredReports={filteredReports}
                downloadReport={downloadReport}
                deleteReport={profile?.role === 'admin' ? deleteReport : undefined}
                isDeletingReport={isDeletingReport}
              />
            ) : (
              <ClientEmptyReport />
            )}
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
};
